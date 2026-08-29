import { BrowserRouter } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/common/ScrollToTop'
import CommunityFab from './components/layout/CommunityFab'
import VerificationBanner from './components/common/VerificationBanner'
import SkillSaarthiLoader from './components/common/SkillSaarthiLoader.jsx'

function AppShell() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem('ss_loader_shown')
  })

  useEffect(() => {
    if (!showSplash) return
    const id = setTimeout(() => {
      try { sessionStorage.setItem('ss_loader_shown', '1') } catch {}
    }, 3400)
    return () => clearTimeout(id)
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