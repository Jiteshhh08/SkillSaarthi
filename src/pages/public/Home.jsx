import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold">Skill_Guide</h1>
      <p className="mt-4 max-w-md text-center text-slate-300">
        Your one-stop personalized career and education advisor.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/signup"
          className="rounded-lg bg-indigo-500 px-6 py-3 font-medium hover:bg-indigo-400"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-slate-600 px-6 py-3 font-medium hover:bg-slate-800"
        >
          Login
        </Link>
      </div>
    </div>
  )
}