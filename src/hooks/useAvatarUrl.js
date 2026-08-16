import { useEffect, useState } from 'react'
import { avatarFileId, loadAvatarUrl } from '../services/auth'

export function useAvatarUrl(user) {
  const [src, setSrc] = useState('')
  const fileId = avatarFileId(user)

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

  return src
}