import { Navigate, Route, Routes } from 'react-router-dom'
import { ProfileCompleteRoute, ProtectedRoute, PublicOnlyRoute } from '../components/common/RouteGuards'
import Dashboard from '../pages/private/Dashboard'
import EducationLevel from '../pages/private/EducationLevel'
import Assessment from '../pages/private/Assessment'
import GitHubAnalysis from '../pages/private/GitHubAnalysis'
import ResumeAnalysis from '../pages/private/ResumeAnalysis'
import CareerComparison from '../pages/private/CareerComparison'
import WhatIfSimulator from '../pages/private/WhatIfSimulator'
import Internships from '../pages/private/Internships'
import Recommendations from '../pages/private/Recommendations'
import SkillGaps from '../pages/private/SkillGaps'
import Roadmaps from '../pages/private/Roadmaps'
import RoadmapDetail from '../pages/private/RoadmapDetail'
import AdminInternships from '../pages/private/AdminInternships'
import Community from '../pages/private/Community'
import CommunityDrafts from '../pages/private/CommunityDrafts'
import CommunityPostDetail from '../pages/private/CommunityPostDetail'
import CommunitySaved from '../pages/private/CommunitySaved'
import CommunityUserProfile from '../pages/private/CommunityUserProfile'
import ProfileSettings from '../pages/private/ProfileSettings'
import Onboarding from '../pages/onboarding/Onboarding'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'
import VerifyPending from '../pages/auth/VerifyPending'
import VerifyOtp from '../pages/auth/VerifyOtp'
import Home from '../pages/public/Home'
import PrivateHome from '../pages/private/Home'

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

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route
        path="/verify-pending"
        element={
          <ProtectedRoute allowUnverified>
            <VerifyPending />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute allowUnverified>
            <PrivateHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute allowUnverified>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/education-level"
        element={
          <ProtectedRoute allowUnverified>
            <EducationLevel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessment"
        element={
          <ProtectedRoute allowUnverified>
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
          <ProtectedRoute allowUnverified>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
