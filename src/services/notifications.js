import { APPWRITE_DATABASE_ID, COLLECTIONS, Query, databases } from './appwrite'

export async function getNotifications(userId, limit = 30) {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.notifications,
      [Query.equal('user_id', userId), Query.limit(limit)],
    )
    return documents
      .map((doc) => ({
        $id: doc.$id,
        title: doc.title || '',
        message: doc.message || '',
        is_read: Boolean(doc.is_read),
        created_at: doc.created_at || '',
      }))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  } catch {
    return []
  }
}

export async function markNotificationRead(notificationId) {
  try {
    await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.notifications, notificationId, {
      is_read: true,
    })
    return true
  } catch {
    return false
  }
}

export async function markAllNotificationsRead(userId) {
  const items = await getNotifications(userId, 100)
  const unread = items.filter((item) => !item.is_read)
  await Promise.all(unread.map((item) => markNotificationRead(item.$id)))
  return unread.length
}

export function timeAgo(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}