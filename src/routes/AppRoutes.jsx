import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProfileCompleteRoute, ProtectedRoute, PublicOnlyRoute } from '../components/common/RouteGuards'
import { routeModules } from './routeModules'

const Dashboard = lazy(routeModules.Dashboard)
const EducationLevel = lazy(routeModules.EducationLevel)
const Assessment = lazy(routeModules.Assessment)
const GitHubAnalysis = lazy(routeModules.GitHubAnalysis)
const ResumeAnalysis = lazy(routeModules.ResumeAnalysis)
const CareerComparison = lazy(routeModules.CareerComparison)
const WhatIfSimulator = lazy(routeModules.WhatIfSimulator)
const Internships = lazy(routeModules.Internships)
const Recommendations = lazy(routeModules.Recommendations)
const SkillGaps = lazy(routeModules.SkillGaps)
const Roadmaps = lazy(routeModules.Roadmaps)
const RoadmapDetail = lazy(routeModules.RoadmapDetail)
const AdminInternships = lazy(routeModules.AdminInternships)
const Community = lazy(routeModules.Community)
const CommunityDrafts = lazy(routeModules.CommunityDrafts)
const CommunityPostDetail = lazy(routeModules.CommunityPostDetail)
const CommunitySaved = lazy(routeModules.CommunitySaved)
const CommunityUserProfile = lazy(routeModules.CommunityUserProfile)
const ProfileSettings = lazy(routeModules.ProfileSettings)
const Assistant = lazy(routeModules.Assistant)
const Onboarding = lazy(routeModules.Onboarding)
const Login = lazy(routeModules.Login)
const Signup = lazy(routeModules.Signup)
const ForgotPassword = lazy(routeModules.ForgotPassword)
const ResetPassword = lazy(routeModules.ResetPassword)
const Home = lazy(routeModules.Home)
const Founders = lazy(routeModules.Founders)
const NotFound = lazy(routeModules.NotFound)
const PrivateHome = lazy(routeModules.PrivateHome)
const VerifyEmail = lazy(routeModules.VerifyEmail)
const VerifyOtp = lazy(routeModules.VerifyOtp)
const VerifyPending = lazy(routeModules.VerifyPending)

import AnimatedLoader from '../components/common/AnimatedLoader'
function PageFallback() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 180)
    return () => clearTimeout(timer)
  }, [])

  return visible ? <AnimatedLoader /> : null
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

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/founders" element={<Founders />} />

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
        path="/assistant"
        element={
          <ProfileCompleteRoute>
            <Assistant />
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

      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
