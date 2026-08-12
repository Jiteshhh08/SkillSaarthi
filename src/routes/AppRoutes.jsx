import { Navigate, Route, Routes } from 'react-router-dom'
import { ProfileCompleteRoute, ProtectedRoute, PublicOnlyRoute } from '../components/common/RouteGuards'
import Dashboard from '../pages/private/Dashboard'
import EducationLevel from '../pages/private/EducationLevel'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import Home from '../pages/public/Home'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/onboarding/education-level"
        element={
          <ProtectedRoute>
            <EducationLevel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProfileCompleteRoute>
            <Dashboard />
          </ProfileCompleteRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}