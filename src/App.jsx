import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/common/ScrollToTop'
import CommunityFab from './components/layout/CommunityFab'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
        <CommunityFab />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App