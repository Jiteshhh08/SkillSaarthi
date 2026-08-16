import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import logo from '../../assets/skillsaarthi_logo.jpeg'

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

export default function TopBar() {
  const { user, loading, logout } = useAuth()
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`)

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    {
      label: 'Explore',
      items: [
        { to: '/recommendations', label: 'Matches' },
        { to: '/internships', label: 'Internships' },
      ],
    },
    {
      label: 'Growth',
      items: [
        { to: '/skill-gaps', label: 'Skill Gaps' },
        { to: '/roadmaps', label: 'Roadmap' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { to: '/github', label: 'GitHub' },
        { to: '/resume', label: 'Resume' },
        { to: '/career-compare', label: 'Compare' },
        { to: '/what-if', label: 'WhatIfSimulator'}
      ],
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2">
          <img src={logo} alt="skillsaarthi logo" className="h-16 w-48 shrink-0 object-cover" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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
          {user && isAdmin && (
            <Link
              to="/admin/internships"
              className={`relative rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                isActive('/admin') ? 'text-brand-deep' : 'text-brand-deep hover:bg-surface-hover'
              }`}
            >
              Admin
              {isActive('/admin') && (
                <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-brand" />
              )}
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="hidden items-center gap-1 rounded-sm border border-accent-orange bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800 sm:inline-flex">
                🔥 0 day streak
              </span>
              <span
                className="hidden max-w-40 truncate rounded-sm px-3 py-2 text-md font-bold text-black lg:inline-block"
                title={user.name}
              >
                {user.name}
              </span>
              <span
                className="grid h-10 w-10 place-items-center rounded-full bg-accent-purple text-sm font-black text-white"
                title={user.name}
              >
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>
              <button onClick={handleLogout} className="btn-secondary rounded-l-none !h-10 !px-4 !text-sm">
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
