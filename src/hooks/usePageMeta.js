import { useEffect } from 'react'

export const SITE_URL = 'https://skillsaarthi.vercel.app'
export const SITE_NAME = 'SkillSaarthi'
export const DEFAULT_TITLE = 'skillसारथी — One-Stop Personalized Career & Education Advisor'
export const DEFAULT_DESCRIPTION =
  'SkillSaarthi (skillसारथी) is a free, personalized career and education advisor. Map your skills to real careers, find your skill gaps, and follow a step-by-step learning roadmap.'

function setMeta(key, content, attr = 'name') {
  if (typeof document === 'undefined' || content == null) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  if (typeof document === 'undefined' || !href) return
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/**
 * Keeps document title, meta description, canonical URL and social tags in
 * sync with the current page. Updates are additive (tags are never removed)
 * so the values always reflect the most recently rendered page.
 *
 * @param {object} [meta]
 * @param {string} [meta.title]       Page title (falls back to the site default).
 * @param {string} [meta.description] Meta description (falls back to the site default).
 * @param {string} [meta.path]        Route path used to build the canonical URL.
 * @param {string} [meta.robots]      Robots directive, e.g. "noindex, nofollow".
 * @param {string} [meta.type]        Open Graph type (default "website").
 * @param {string} [meta.image]       Absolute image URL for social sharing.
 */
export function usePageMeta({
  title,
  description,
  path = '/',
  robots = 'index, follow',
  type = 'website',
  image,
} = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    const finalTitle = title || DEFAULT_TITLE
    const finalDescription = description || DEFAULT_DESCRIPTION
    const url = `${SITE_URL}${path}`

    document.title = finalTitle

    setMeta('description', finalDescription)
    setMeta('robots', robots)
    setMeta('og:site_name', SITE_NAME, 'property')
    setMeta('og:title', finalTitle, 'property')
    setMeta('og:description', finalDescription, 'property')
    setMeta('og:url', url, 'property')
    setMeta('og:type', type, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', finalTitle)
    setMeta('twitter:description', finalDescription)
    if (image) {
      setMeta('og:image', image, 'property')
      setMeta('twitter:image', image)
    }
    setCanonical(url)
  }, [title, description, path, robots, type, image])
}

export default usePageMeta
