import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import NotificationBell from './NotificationBell'
import Icon from '../common/Icon'
import { useAvatarUrl } from '../../hooks/useAvatarUrl'
import logo from '../../assets/skillsaarthi_logo.webp'

function NavDropdown({ label, items, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
          active ? 'text-brand-deep' : 'text-ink hover:bg-surface-hover'
        }`}
      >
        {label}
        {active && <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-brand" />}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-line bg-white p-1 shadow-popover"
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileMenu({ user, onLogout, isAdmin, isAdminLoading }) {
  const avatarSrc = useAvatarUrl(user)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-hover"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-purple text-sm font-black text-white">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.name || 'U').charAt(0).toUpperCase()
          )}
        </span>
        <span
          className="hidden max-w-40 truncate text-md font-bold text-black lg:inline-block"
          title={user.name}
        >
          {user.name}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-lg border border-line bg-white p-1 shadow-popover"
        >
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover"
          >
            <Icon name="settings" size={16} className="text-ink-muted" />
            Update profile
          </Link>
          {isAdminLoading ? (
            <span className="flex items-center gap-2 px-3 py-2">
              <span className="h-4 w-4 animate-pulse rounded bg-surface-soft" />
              <span className="h-4 w-20 animate-pulse rounded bg-surface-soft" />
            </span>
          ) : isAdmin ? (
            <Link
              to="/admin/internships"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover"
            >
              <Icon name="shield-check" size={16} className="text-ink-muted" />
              Admin panel
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-danger hover:bg-danger-soft"
          >
            <Icon name="log-out" size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function MobileMenu({ user, navItems, isAdmin, isAdminLoading, isActive, open, onNavigate, onClose, onLogout }) {
  const avatarSrc = useAvatarUrl(user)

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = original
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const handleLogout = async () => {
    onNavigate()
    await onLogout()
  }

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-white min-[1070px]:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <nav className="mx-auto max-w-7xl space-y-4 px-6 pb-10 pt-24">
        {user ? (
          <>
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-purple text-sm font-black text-white">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user.name || 'U').charAt(0).toUpperCase()
                )}
              </span>
              <span className="min-w-0 truncate text-md font-bold text-black">{user.name}</span>
            </div>

            {navItems.map((item) =>
              item.items ? (
                <div key={item.label}>
                  <p className="text-xs font-black uppercase tracking-wide text-ink-muted">
                    {item.label}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {item.items.map((sub) => (
                      <li key={sub.to}>
                        <Link
                          to={sub.to}
                          onClick={onNavigate}
                          className={`block rounded-md px-3 py-2 text-sm font-bold ${
                            isActive(sub.to)
                              ? 'bg-brand-soft text-brand-deep'
                              : 'text-ink hover:bg-surface-hover'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={`block rounded-md px-3 py-2 text-sm font-bold ${
                    isActive(item.to)
                      ? 'bg-brand-soft text-brand-deep'
                      : 'text-ink hover:bg-surface-hover'
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}

            {isAdminLoading ? (
              <span className="block h-9 animate-pulse rounded-md bg-surface-soft" />
            ) : isAdmin ? (
              <Link
                to="/admin/internships"
                onClick={onNavigate}
                className={`block rounded-md px-3 py-2 text-sm font-bold ${
                  isActive('/admin') ? 'bg-brand-soft text-brand-deep' : 'text-ink hover:bg-surface-hover'
                }`}
              >
                Admin
              </Link>
            ) : null}

            <div className="border-t border-line pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-danger hover:bg-danger-soft"
              >
                <Icon name="log-out" size={16} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface-hover"
            >
              Start learning
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}

export default function TopBar() {
  const { user, loading, logout, streak, streakLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`)

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    {
      label: 'Discover',
      items: [
        { to: '/recommendations', label: 'Matches' },
        { to: '/skill-gaps', label: 'Skill Gaps' },
        { to: '/career-compare', label: 'Compare' },
        { to: '/what-if', label: 'What-If' },
      ],
    },
    {
      label: 'Build',
      items: [
        { to: '/roadmaps', label: 'Roadmap' },
        { to: '/resume', label: 'Resume' },
        { to: '/github', label: 'GitHub' },
      ],
    },
    {
      label: 'Opportunities',
      items: [
        { to: '/internships', label: 'Internships' },
        { to: '/community', label: 'Community' },
      ],
    },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="relative z-50 mx-auto flex h-20 max-w-7xl items-center gap-2 px-3 sm:gap-6 sm:px-6">
        <Link to={user ? '/home' : '/'} className="flex min-w-0 shrink items-center gap-2 -ml-1 sm:ml-0">
          <img src={logo} alt="skillsaarthi logo" className="h-16 w-48 shrink-0 object-cover" />
        </Link>

        <nav className="hidden items-center gap-1 min-[1070px]:flex">
          {user &&
            navItems.map((item) =>
              item.items ? (
                <NavDropdown
                  key={item.label}
                  label={item.label}
                  items={item.items}
                  active={item.items.some((i) => isActive(i.to))}
                />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                    isActive(item.to) ? 'text-brand-deep' : 'text-ink hover:bg-surface-hover'
                  }`}
                >
                  {item.label}
                  {isActive(item.to) && (
                    <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-brand" />
                  )}
                </Link>
              )
            )}
          {/* Admin moved to profile menu */}
        </nav>

        <div className="ml-auto flex shrink items-center gap-1 pl-1 sm:gap-3 sm:pl-2">
          {loading ? null : user ? (
            <>
              <NotificationBell />
              {streakLoading ? (
                <span className="hidden h-9 w-28 animate-pulse rounded-sm bg-surface-soft sm:inline-flex" />
              ) : (
                <span className="hidden items-center gap-1 rounded-sm border border-accent-orange bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800 sm:inline-flex">
                  <Icon name="flame" size={16} className="text-accent-orange" />
                  {streak.current} {streak.current === 1 ? 'day' : 'days'} streak
                </span>
              )}
              <ProfileMenu user={user} onLogout={handleLogout} isAdmin={isAdmin} isAdminLoading={adminLoading} />
            </>
          ) : (
            <>
              <Link to="/login" className="hidden btn-secondary !h-10 !px-4 !text-sm sm:inline-flex">
                Login
              </Link>
              <Link to="/signup" className="hidden btn-primary !h-10 !px-4 !text-sm sm:inline-flex">
                Start learning
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-hover sm:mr-3 min-[1070px]:hidden"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      </header>
      <MobileMenu
        user={user}
        navItems={navItems}
        isAdmin={isAdmin}
        isAdminLoading={adminLoading}
        isActive={isActive}
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
    </>
  )
}