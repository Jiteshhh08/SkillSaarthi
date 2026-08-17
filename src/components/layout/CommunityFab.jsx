import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Icon from '../common/Icon'

export default function CommunityFab() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading || !user) return null
  if (pathname === '/community' || pathname.startsWith('/community/')) return null

  return (
    <Link
      to="/community"
      aria-label="Open the Skill Saarthi community"
      className="fixed bottom-8 right-16 z-50 flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 text-base font-bold text-white shadow-modal ring-4 ring-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-popover active:bg-brand-active"
    >
      <Icon name="users" size={22} />
      Community
    </Link>
  )
}