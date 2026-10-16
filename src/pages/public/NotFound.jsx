import { Link } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta({
    title: 'Page not found | SkillSaarthi',
    description: 'The page you are looking for could not be found.',
    path: '/404',
    robots: 'noindex, follow',
  })

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand-deep">Error 404</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-ink-strong md:text-6xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
          The link may be broken or the page may have moved. Head back to the homepage to keep
          exploring career paths, or meet the people behind SkillSaarthi.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary">Back to home</Link>
          <Link to="/founders" className="btn-secondary">Meet the founders</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
