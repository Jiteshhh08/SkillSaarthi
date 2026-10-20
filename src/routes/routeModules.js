/**
 * Central map of lazily-loaded route modules.
 *
 * Kept in one place so the same dynamic imports can be used both by
 * `React.lazy` in AppRoutes and by `prefetchRouteModules()` to warm the
 * chunks during idle time. Warming the chunks means navigating between
 * pages never suspends, so the shell (header/footer) is never replaced by
 * the full-screen fallback.
 */
export const routeModules = {
  Dashboard: () => import('../pages/private/Dashboard'),
  EducationLevel: () => import('../pages/private/EducationLevel'),
  Assessment: () => import('../pages/private/Assessment'),
  GitHubAnalysis: () => import('../pages/private/GitHubAnalysis'),
  ResumeAnalysis: () => import('../pages/private/ResumeAnalysis'),
  CareerComparison: () => import('../pages/private/CareerComparison'),
  WhatIfSimulator: () => import('../pages/private/WhatIfSimulator'),
  Internships: () => import('../pages/private/Internships'),
  Recommendations: () => import('../pages/private/Recommendations'),
  SkillGaps: () => import('../pages/private/SkillGaps'),
  Roadmaps: () => import('../pages/private/Roadmaps'),
  RoadmapDetail: () => import('../pages/private/RoadmapDetail'),
  AdminInternships: () => import('../pages/private/AdminInternships'),
  Community: () => import('../pages/private/Community'),
  CommunityDrafts: () => import('../pages/private/CommunityDrafts'),
  CommunityPostDetail: () => import('../pages/private/CommunityPostDetail'),
  CommunitySaved: () => import('../pages/private/CommunitySaved'),
  CommunityUserProfile: () => import('../pages/private/CommunityUserProfile'),
  ProfileSettings: () => import('../pages/private/ProfileSettings'),
  Assistant: () => import('../pages/private/Assistant'),
  Onboarding: () => import('../pages/onboarding/Onboarding'),
  Login: () => import('../pages/auth/Login'),
  Signup: () => import('../pages/auth/Signup'),
  ForgotPassword: () => import('../pages/auth/ForgotPassword'),
  ResetPassword: () => import('../pages/auth/ResetPassword'),
  Home: () => import('../pages/public/Home'),
  Founders: () => import('../pages/public/Founders'),
  NotFound: () => import('../pages/public/NotFound'),
  PrivateHome: () => import('../pages/private/Home'),
  VerifyEmail: () => import('../pages/auth/VerifyEmail'),
  VerifyOtp: () => import('../pages/auth/VerifyOtp'),
  VerifyPending: () => import('../pages/auth/VerifyPending'),
}

let prefetchStarted = false

/**
 * Warm every route chunk in the background. Safe to call more than once —
 * only the first call does work. Errors are ignored (a failed prefetch just
 * means the chunk loads on demand as before).
 */
export function prefetchRouteModules() {
  if (prefetchStarted || typeof window === 'undefined') return
  prefetchStarted = true

  const run = () => {
    for (const load of Object.values(routeModules)) {
      load().catch(() => {})
    }
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 2500 })
  } else {
    window.setTimeout(run, 1500)
  }
}
