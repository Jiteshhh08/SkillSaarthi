import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AuthContext } from '../context/authContext'
import Home from '../pages/public/Home'
import Founders from '../pages/public/Founders'
import NotFound from '../pages/public/NotFound'

// Render-time auth stub. Public pages only ever read the logged-out branch
// during prerendering, so no network calls are made.
const authStub = {
  user: null,
  profile: null,
  loading: false,
  profileLoading: false,
  streak: { current: 0, best: 0 },
  streakLoading: false,
  emailVerified: null,
  verificationLoading: false,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
  refreshProfile: async () => null,
  refreshUser: async () => null,
  refreshVerification: async () => null,
}

const ROUTES = {
  '/': Home,
  '/founders': Founders,
}

/**
 * Render a public route to an HTML string for build-time prerendering.
 * @param {string} path
 * @returns {string}
 */
export function render(path) {
  const Page = ROUTES[path] || NotFound
  return renderToString(
    <StaticRouter location={path}>
      <AuthContext.Provider value={authStub}>
        <Page />
      </AuthContext.Provider>
    </StaticRouter>,
  )
}

export const PRERENDER_ROUTES = Object.keys(ROUTES)
