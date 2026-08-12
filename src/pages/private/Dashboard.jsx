import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-bold">Skill_Guide</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-bold">Welcome, {user?.name || 'there'} 👋</h2>
        <p className="mt-2 text-slate-400">
          Your dashboard will show career readiness, recommendations, skill gaps, and your
          roadmap.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold">Career Match</h3>
            <p className="mt-2 text-sm text-slate-400">Complete your profile to see matches.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold">Skill Gaps</h3>
            <p className="mt-2 text-sm text-slate-400">No analysis yet.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold">Roadmap</h3>
            <p className="mt-2 text-sm text-slate-400">Generate your first roadmap.</p>
          </div>
        </div>
      </main>
    </div>
  )
}