import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/skillsaarthi_logo.jpeg'

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="bg-deep">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="skillsaarthi logo" className="h-16 w-48 rounded-lg object-cover" />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Personalized career guidance, skill building, and learning roadmaps — for free,
            for everyone.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {user ? (
              <>
                <li><Link to="/home" className="hover:text-white">Home</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/onboarding" className="hover:text-white">Manage my profile</Link></li>
                <li><Link to="/assessment" className="hover:text-white">Retake assessment</Link></li>
                <li><Link to="/github" className="hover:text-white">GitHub analysis</Link></li>
                <li><Link to="/internships" className="hover:text-white">Internships</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/signup" className="hover:text-white">Get started</Link></li>
                <li><Link to="#subjects" className="hover:text-white">Explore subjects</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {user ? (
              <li>
                <Link to="/dashboard" className="hover:text-white">My dashboard</Link>
              </li>
            ) : (
              <>
                <li><Link to="/signup" className="hover:text-white">Create account</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-white">About</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-white">Our mission</Link></li>
            <li><Link to="/" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} skillsaarthi. Inspired by the warmth of free education.
        </p>
      </div>
    </footer>
  )
}