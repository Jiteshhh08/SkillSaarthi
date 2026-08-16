import { account, AVATAR_BUCKET_ID, ID, storage } from './appwrite'

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

export function avatarUrl(user) {
  const fileId = avatarFileId(user)
  if (!fileId || !AVATAR_BUCKET_ID) return ''
  return storage.getFilePreview(AVATAR_BUCKET_ID, fileId, 128, 128)
}