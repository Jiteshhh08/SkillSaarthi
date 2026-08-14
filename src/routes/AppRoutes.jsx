import { Navigate, Route, Routes } from 'react-router-dom'
import { ProfileCompleteRoute, ProtectedRoute, PublicOnlyRoute } from '../components/common/RouteGuards'
import Dashboard from '../pages/private/Dashboard'
import EducationLevel from '../pages/private/EducationLevel'
import Assessment from '../pages/private/Assessment'
import GitHubAnalysis from '../pages/private/GitHubAnalysis'
import Internships from '../pages/private/Internships'
import Onboarding from '../pages/onboarding/Onboarding'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import Home from '../pages/public/Home'

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Home />
          </PublicOnlyRoute>
        }
      />

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
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
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
        path="/assessment"
        element={
          <ProtectedRoute>
            <Assessment />
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

      <Route
        path="/github"
        element={
          <ProfileCompleteRoute>
            <GitHubAnalysis />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/internships"
        element={
          <ProfileCompleteRoute>
            <Internships />
          </ProfileCompleteRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
