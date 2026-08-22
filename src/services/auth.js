import { account, appwriteClient, AVATAR_BUCKET_ID, ID, storage } from './appwrite'

export async function signUp(name, email, password) {
  await account.create(ID.unique(), email, password, name)
  return login(email, password)
}

export async function login(email, password) {
  return account.createEmailPasswordSession(email, password)
}

export async function logout() {
  try {
    await account.deleteSession('current')
  } catch {
    // ignore: no active session to delete
  }
}

export async function getCurrentUser() {
  return account.get()
}

export async function createRecovery(email) {
  return account.createRecovery(
    email,
    `${window.location.origin}/reset-password`
  )
}

export async function updateRecovery(userId, secret, password) {
  return account.updateRecovery(userId, secret, password, password)
}

export async function updateName(name) {
  return account.updateName(name)
}

export async function uploadAvatar(file) {
  if (!AVATAR_BUCKET_ID) {
    throw new Error('Avatar uploads are not configured (missing VITE_APPWRITE_AVATAR_BUCKET_ID).')
  }
  const uploaded = await storage.createFile(AVATAR_BUCKET_ID, ID.unique(), file)
  return account.updatePrefs({ avatar_file_id: uploaded.$id })
}

export async function removeAvatar() {
  return account.updatePrefs({ avatar_file_id: '' })
}

export function avatarFileId(user) {
  return user?.prefs?.avatar_file_id || ''
}

const avatarObjectUrls = new Map()

export async function loadAvatarUrl(user) {
  const fileId = avatarFileId(user)
  if (!fileId || !AVATAR_BUCKET_ID) return ''
  if (avatarObjectUrls.has(fileId)) return avatarObjectUrls.get(fileId)
  try {
    // The <img> URL alone does not carry the Appwrite session, so fetch the
    // original bytes through the SDK client (sends the JWT/session) and show a
    // blob URL. Use the /view endpoint, not /preview — the free plan blocks
    // image transformations (resize).
    const url = new URL(storage.getFileView(AVATAR_BUCKET_ID, fileId))
    const bytes = await appwriteClient.call('get', url, undefined, undefined, 'arrayBuffer')
    const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }))
    avatarObjectUrls.set(fileId, objectUrl)
    return objectUrl
  } catch {
    return ''
  }
}

export function clearAvatarCache(fileId) {
  if (fileId && avatarObjectUrls.has(fileId)) {
    URL.revokeObjectURL(avatarObjectUrls.get(fileId))
    avatarObjectUrls.delete(fileId)
  }
}