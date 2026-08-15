import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'

export default function TopBar() {
  const { user, loading, logout } = useAuth()
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 16v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 16H4a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1h-3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7h6M8 10h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-lg font-black text-ink">Skill Guide</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <Link to="/home" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Home
              </Link>
              <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Dashboard
              </Link>
              <Link to="/recommendations" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Matches
              </Link>
              <Link to="/skill-gaps" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Skill Gaps
              </Link>
              <Link to="/roadmaps" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Roadmap
              </Link>
              <Link to="/github" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                GitHub
              </Link>
              <Link to="/internships" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Internships
              </Link>
              {isAdmin && (
                <Link to="/admin/internships" className="rounded-md px-3 py-2 text-sm font-bold text-brand-deep hover:bg-surface-hover">
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="hidden items-center gap-1 rounded-full border border-accent-yellow bg-cream px-3 py-1 text-sm font-bold text-amber-800 sm:inline-flex">
                ⚡ 0
              </span>
              <span className="hidden items-center gap-1 rounded-full border border-accent-orange bg-orange-50 px-3 py-1 text-sm font-bold text-orange-800 sm:inline-flex">
                🔥 0 day streak
              </span>
              <span
                className="grid h-10 w-10 place-items-center rounded-full bg-accent-purple text-sm font-black text-white"
                title={user.name}
              >
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>
              <button onClick={handleLogout} className="btn-secondary !h-10 !px-4 !text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !h-10 !px-4 !text-sm">
                Login
              </Link>
              <Link to="/signup" className="btn-primary !h-10 !px-4 !text-sm">
                Start learning
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}