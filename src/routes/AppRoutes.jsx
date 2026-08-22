import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProfileCompleteRoute, ProtectedRoute, PublicOnlyRoute } from '../components/common/RouteGuards'

const Dashboard = lazy(() => import('../pages/private/Dashboard'))
const EducationLevel = lazy(() => import('../pages/private/EducationLevel'))
const Assessment = lazy(() => import('../pages/private/Assessment'))
const GitHubAnalysis = lazy(() => import('../pages/private/GitHubAnalysis'))
const ResumeAnalysis = lazy(() => import('../pages/private/ResumeAnalysis'))
const CareerComparison = lazy(() => import('../pages/private/CareerComparison'))
const WhatIfSimulator = lazy(() => import('../pages/private/WhatIfSimulator'))
const Internships = lazy(() => import('../pages/private/Internships'))
const Recommendations = lazy(() => import('../pages/private/Recommendations'))
const SkillGaps = lazy(() => import('../pages/private/SkillGaps'))
const Roadmaps = lazy(() => import('../pages/private/Roadmaps'))
const RoadmapDetail = lazy(() => import('../pages/private/RoadmapDetail'))
const AdminInternships = lazy(() => import('../pages/private/AdminInternships'))
const Community = lazy(() => import('../pages/private/Community'))
const CommunityDrafts = lazy(() => import('../pages/private/CommunityDrafts'))
const CommunityPostDetail = lazy(() => import('../pages/private/CommunityPostDetail'))
const CommunitySaved = lazy(() => import('../pages/private/CommunitySaved'))
const CommunityUserProfile = lazy(() => import('../pages/private/CommunityUserProfile'))
const ProfileSettings = lazy(() => import('../pages/private/ProfileSettings'))
const Onboarding = lazy(() => import('../pages/onboarding/Onboarding'))
const Login = lazy(() => import('../pages/auth/Login'))
const Signup = lazy(() => import('../pages/auth/Signup'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))
const Home = lazy(() => import('../pages/public/Home'))
const PrivateHome = lazy(() => import('../pages/private/Home'))

function PageFallback() {
  return <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">Loading…</div>
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPassword />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <PrivateHome />
          </ProtectedRoute>
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
        path="/recommendations"
        element={
          <ProfileCompleteRoute>
            <Recommendations />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/skill-gaps"
        element={
          <ProfileCompleteRoute>
            <SkillGaps />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/skill-gaps/:careerId"
        element={
          <ProfileCompleteRoute>
            <SkillGaps />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/roadmaps"
        element={
          <ProfileCompleteRoute>
            <Roadmaps />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/roadmaps/:id"
        element={
          <ProfileCompleteRoute>
            <RoadmapDetail />
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
        path="/resume"
        element={
          <ProfileCompleteRoute>
            <ResumeAnalysis />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/career-compare"
        element={
          <ProfileCompleteRoute>
            <CareerComparison />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/what-if"
        element={
          <ProfileCompleteRoute>
            <WhatIfSimulator />
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

      <Route
        path="/admin/internships"
        element={
          <ProtectedRoute>
            <AdminInternships />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community"
        element={
          <ProfileCompleteRoute>
            <Community />
          </ProfileCompleteRoute>
        }
      />
      <Route
        path="/community/saved"
        element={
          <ProfileCompleteRoute>
            <CommunitySaved />
          </ProfileCompleteRoute>
        }
      />
      <Route
        path="/community/drafts"
        element={
          <ProfileCompleteRoute>
            <CommunityDrafts />
          </ProfileCompleteRoute>
        }
      />
      <Route
        path="/community/posts/:id"
        element={
          <ProfileCompleteRoute>
            <CommunityPostDetail />
          </ProfileCompleteRoute>
        }
      />
      <Route
        path="/community/users/:userId"
        element={
          <ProfileCompleteRoute>
            <CommunityUserProfile />
          </ProfileCompleteRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
