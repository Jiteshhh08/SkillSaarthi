import { account, ID } from './appwrite'

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