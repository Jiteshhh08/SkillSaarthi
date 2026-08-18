import { useEffect, useState } from 'react'
import { avatarFileId, loadAvatarUrl } from '../../services/auth'

export default function Avatar({ user, size = 40, className = '' }) {
  const [src, setSrc] = useState('')
  const fileId = avatarFileId(user)
  const fallbackText = (user?.name || 'U').charAt(0).toUpperCase()

  useEffect(() => {
    let cancelled = false
    if (!fileId) {
      setSrc('')
      return () => {
        cancelled = true
      }
    }
    loadAvatarUrl(user).then((url) => {
      if (!cancelled && url) setSrc(url)
    })
    return () => {
      cancelled = true
    }
  }, [fileId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent-purple font-black text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : fallbackText}
    </span>
  )
}