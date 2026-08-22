import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/common/ScrollToTop'
import CommunityFab from './components/layout/CommunityFab'
import VerificationBanner from './components/common/VerificationBanner'

function AppShell() {
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