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
      className="group fixed bottom-8 right-8 z-50 flex h-14 items-center overflow-hidden rounded-xl bg-brand text-white shadow-popover ring-4 ring-brand/20 transition-all duration-300 hover:rounded-2xl hover:bg-brand-hover hover:shadow-modal hover:ring-brand/35 active:bg-brand-active"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center">
        <Icon name="users" size={26} />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-base font-bold opacity-0 transition-all duration-300 group-hover:max-w-36 group-hover:pl-1 group-hover:pr-4 group-hover:opacity-100">
        Community
      </span>
    </Link>
  )
}