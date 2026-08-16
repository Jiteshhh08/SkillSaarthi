export function required(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required.`
  }
  return ''
}

export function minLength(value, label, min) {
  const text = value === undefined || value === null ? '' : String(value).trim()
  if (text.length > 0 && text.length < min) {
    return `${label} must be at least ${min} characters.`
  }
  return ''
}

export function maxLength(value, label, max) {
  const text = value === undefined || value === null ? '' : String(value)
  if (text.length > max) {
    return `${label} must be ${max} characters or fewer.`
  }
  return ''
}

export function integerInRange(value, label, min, max) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required.`
  }
  const number = Number(value)
  if (!Number.isFinite(number)) return `${label} must be a number.`
  if (!Number.isInteger(number)) return `${label} must be a whole number.`
  if (number < min || number > max) return `${label} must be between ${min} and ${max}.`
  return ''
}

export function decimalInRange(value, label, min, max) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required.`
  }
  const number = Number(value)
  if (!Number.isFinite(number)) return `${label} must be a number.`
  if (number < min || number > max) return `${label} must be between ${min} and ${max}.`
  return ''
}

export function lettersOnly(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') return ''
  const text = String(value).trim()
  if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(text)) {
    return `${label} should only contain letters, spaces, dots, and hyphens.`
  }
  return ''
}

export function wordsAndNumbers(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') return ''
  const text = String(value).trim()
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 .,'&-]*$/.test(text)) {
    return `${label} contains invalid characters.`
  }
  return ''
}

const KEYBOARD_PATTERNS = [
  'qwerty', 'qazwsx', 'asdfgh', 'zxcvbn', 'poiuyt', 'lkjhgf', 'mnbvcx',
  'asdf', 'qwer', 'zxcv', 'vbnm', 'hjkl', 'poiu', 'lkjh', 'mnb',
]

function repeatedCharacterRun(text) {
  return /(.)\1{2,}/.test(text)
}

function keyboardSmash(text) {
  const compact = text.toLowerCase().replace(/[^a-z]/g, '')
  return KEYBOARD_PATTERNS.some((pattern) => compact.includes(pattern))
}

function repeatedWordRun(text) {
  const words = text.toLowerCase().match(/[a-z0-9]+/g)
  if (!words || words.length < 3) return false
  return new Set(words).size === 1
}

function tooFewDistinct(text, minDistinct) {
  const compact = text.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (compact.length < minDistinct) return false
  return new Set(compact).size < minDistinct
}

function requiresLetters(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '')
  return letters.length === 0
}

function readsLikeWords(text) {
  const words = text.match(/[a-zA-Z]+/g) || []
  if (words.length === 0) return false
  return words.some((word) => /[aeiou]/i.test(word) || word.length >= 4 || /^[A-Z]{2,}$/.test(word))
}

function hasGibberishWord(text) {
  const words = text.match(/[a-zA-Z]+/g) || []
  return words.some((word) => {
    const isAcronym = /^[A-Z]{2,}$/.test(word)
    const hasVowel = /[aeiou]/i.test(word)
    return !isAcronym && !hasVowel && word.length >= 4
  })
}

export function meaningful(value, label, { minDistinct = 4 } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') return ''
  const text = String(value).trim()
  if (requiresLetters(text)) return `${label} must contain words, not just numbers or symbols.`
  if (repeatedCharacterRun(text)) {
    return `${label} looks like repeated characters — please enter a real answer.`
  }
  if (keyboardSmash(text)) {
    return `${label} looks like keyboard mashing — please enter a real answer.`
  }
  if (repeatedWordRun(text)) {
    return `${label} looks like repeated text — please enter a real answer.`
  }
  if (tooFewDistinct(text, minDistinct)) {
    return `${label} looks like nonsense — please enter a real answer.`
  }
  if (!readsLikeWords(text)) {
    return `${label} doesn't read like real words — please enter a real answer.`
  }
  if (hasGibberishWord(text)) {
    return `${label} looks like gibberish — please enter a real answer.`
  }
  return ''
}

export function commaSeparated(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') return ''
  const items = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (items.length === 0) return `${label} must contain at least one item.`
  return ''
}

export function meaningfulList(value, label, { minItems = 2, itemMinChars = 2 } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') return ''
  const items = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (items.length === 0) return `${label} must contain at least one item.`
  if (items.length === 1 && items[0].length < minItems) {
    return `${label} should list at least two things separated by commas.`
  }
  if (items.some((item) => item.length < itemMinChars)) {
    return `${label} contains an item that is too short.`
  }
  const bad = items.find((item) => meaningful(item, label.replace(/s$/, '')))
  if (bad) return `${label} looks like nonsense — please enter real items.`
  return ''
}

export function validateFields(rules) {
  const errors = {}
  for (const [field, checks] of Object.entries(rules)) {
    for (const check of checks) {
      const message = check()
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}