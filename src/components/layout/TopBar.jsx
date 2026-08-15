import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import logo from '../../assets/skillsaarthi_logo.jpeg'

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
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2">
          <img src={logo} alt="skillsaarthi logo" className="h-16 w-48 shrink-0 object-cover" />
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
              <Link to="/resume" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Resume
              </Link>
              <Link to="/career-compare" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover">
                Compare
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