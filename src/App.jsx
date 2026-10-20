import { BrowserRouter } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/common/ScrollToTop'
import CommunityFab from './components/layout/CommunityFab'
import VerificationBanner from './components/common/VerificationBanner'
import SkillSaarthiLoader from './components/common/SkillSaarthiLoader.jsx'
import { prefetchRouteModules } from './routes/routeModules'

const LOADER_SEEN_KEY = 'ss_loader_seen'

function AppShell() {
  // Show the brand splash only the very first time a visitor opens the app.
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !localStorage.getItem(LOADER_SEEN_KEY)
    } catch {
      return false
    }
  })

  useEffect(() => {
    prefetchRouteModules()
  }, [])

  useEffect(() => {
    if (!showSplash) return
    try {
      localStorage.setItem(LOADER_SEEN_KEY, '1')
    } catch {}
  }, [showSplash])

  if (showSplash) {
    return <SkillSaarthiLoader onDone={() => setShowSplash(false)} />
  }

  return (
    <>
      <VerificationBanner />
      <AppRoutes />
      <CommunityFab />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App