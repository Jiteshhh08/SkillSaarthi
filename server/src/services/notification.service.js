import { COLLECTIONS, ID, Permission, Query, Role, databases, users } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Resolves an Appwrite user ID from an email address.
 * Returns the user's `$id`, or null when no user matches.
 * Requires the API key to have the `users.read` scope.
 */
export async function resolveUserIdByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) return null
  let result
  try {
    result = await users.list([
      Query.equal('email', normalized),
      Query.limit(1),
    ])
  } catch {
    throw new ApiError(
      500,
      'Could not look up users by email — the Appwrite API key needs the `users.read` scope.',
      'USERS_SCOPE_MISSING',
    )
  }
  return result?.users?.[0]?.$id || null
}

/**
 * Creates a notification for a single user.
 *
 * Notifications are stored in the `notifications` collection, one document per
 * recipient, with per-document permissions scoped to that user so only they can
 * read/update it. Senders are either the system (backend — e.g. "your matches
 * are ready") or an admin (via the admin API).
 */
export async function notify(userId, title, message) {
  if (!userId || !title || !String(title).trim()) return null
  try {
    return await databases.createDocument(
      config.appwrite.databaseId,
      COLLECTIONS.notifications,
      ID.unique(),
      {
        user_id: userId,
        title: String(title).trim(),
        message: message || '',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    )
  } catch {
    return null
  }
}

/**
 * Broadcasts a notification to every user (used by admins for announcements).
 * One document per recipient, so each user only sees their own inbox.
 */
export async function notifyAllUsers(title, message) {
  if (!title || !String(title).trim()) return 0
  const userIds = new Set()
  let offset = 0
  while (true) {
    const page = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.profiles, [
      Query.limit(100),
      Query.offset(offset),
    ])
    for (const doc of page.documents) {
      if (doc.user_id) userIds.add(doc.user_id)
    }
    if (page.documents.length < 100) break
    offset += 100
  }

  let sent = 0
  for (const userId of userIds) {
    const created = await notify(userId, title, message)
    if (created) sent += 1
  }
  return sent
}