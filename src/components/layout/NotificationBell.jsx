import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Icon from '../common/Icon'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  timeAgo,
} from '../../services/notifications'
import { APPWRITE_DATABASE_ID, COLLECTIONS, appwriteClient } from '../../services/appwrite'

const POLL_MS = 45000

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  const refresh = useCallback(() => {
    if (!user) return
    getNotifications(user.$id).then(setNotifications).catch(() => {})
  }, [user])

  useEffect(() => {
    refresh()
    // Realtime subscription for instant updates; keep polling as fallback for offline/unsupported envs
    let unsubscribe = () => {}
    try {
      const channel = `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.notifications}.documents`
      unsubscribe = appwriteClient.subscribe(channel, (event) => {
        const doc = event.payload
        if (!doc || !user) return
        // Only react to docs for current user
        if (doc.user_id && doc.user_id !== user.$id) return
        refresh()
      })
    } catch {
      // subscribe not available (e.g., missing Realtime) — polling remains
    }
    const interval = setInterval(refresh, POLL_MS)
    return () => {
      try {
        unsubscribe()
      } catch {}
      clearInterval(interval)
    }
  }, [refresh, user?.$id])

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  if (!user) return null

  const unread = notifications.filter((item) => !item.is_read).length

  const handleRead = async (id) => {
    if (await markNotificationRead(id)) {
      setNotifications((current) =>
        current.map((item) => (item.$id === id ? { ...item, is_read: true } : item)),
      )
    }
  }

  const handleReadAll = async () => {
    if (busy) return
    setBusy(true)
    const marked = await markAllNotificationsRead(user.$id)
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
    setBusy(false)
    if (marked === 0) setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications (${unread} unread)`}
        className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-hover"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent-red px-1 text-[10px] font-black text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-20 z-50 overflow-hidden rounded-lg border border-line bg-white shadow-popover sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <p className="text-sm font-black text-ink">Notifications</p>
            <button
              type="button"
              onClick={handleReadAll}
              disabled={busy || unread === 0}
              className="text-xs font-bold text-brand-deep hover:underline disabled:text-ink-disabled"
            >
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Icon name="party" size={24} className="text-brand-deep" />
              <p className="text-sm text-ink-muted">You&apos;re all caught up</p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map((item) => (
                <li key={item.$id}>
                  <button
                    type="button"
                    onClick={() => handleRead(item.$id)}
                    className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-surface-hover ${
                      item.is_read ? 'opacity-60' : ''
                    }`}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-ink">{item.title}</span>
                      <span className="shrink-0 text-[10px] font-bold text-ink-soft">
                        {timeAgo(item.created_at)}
                      </span>
                    </span>
                    {item.message && (
                      <span className="text-xs leading-relaxed text-ink-muted">{item.message}</span>
                    )}
                    {!item.is_read && (
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}