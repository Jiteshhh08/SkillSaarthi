# PROJECT_AUDIT — skillsaarthi Full Optimization & Simplification Audit

> Generated: 2026-08-22 | Inspect-before-modify audit. No code changes applied yet.
> Stack: React 19 + Vite 8 + Tailwind 4 + React Router 7 (frontend) | Node/Express (server/) | Python FastAPI (ai-service/) | Appwrite (Auth/DB/Storage/Realtime)

---

## 1. Current Architecture

### High-level
```
User → React + Tailwind (src/App.jsx:7, src/routes/AppRoutes.jsx:30)
          ├─→ Appwrite Web SDK (auth, DB, Storage, Realtime) — direct from browser
          └─→ Node/Express (server/src/app.js:16) — JWT Bearer (Appwrite session)
                 └─→ Python AI Service (ai-service/app/main.py:57) — FastAPI on :8000
```

- **Frontend** `src/` — 23 routes, `BrowserRouter` + `AuthProvider` (`src/context/AuthContext.jsx:12`). No code-splitting; all pages eager-imported in `src/routes/AppRoutes.jsx:3-28`. JWT created per-request via `account.createJWT()` (`src/services/api.js:9`). `TopBar.jsx:10` + `MobileMenu` + `CommunityFab.jsx:1` handle nav.
- **Backend** `server/src/app.js:30` — 10 route groups under `/api` (health, careers, recommendations, github, resume, internships, admin, roadmaps, what-if, community). Auth `server/src/middleware/auth.middleware.js:6`, admin `server/src/middleware/admin.middleware.js`, error handler `server/src/middleware/error.middleware.js:1`.
- **AI Service** `ai-service/app/main.py` — 6 endpoints: `GET /health`, `POST /ai/resume/{extract,analyze,match,optimize,generate}`. Version `0.2.0`. Resume-only LLM service.
- **Data** Appwrite Database: `profiles` (docId = user `$id`), `user_skills`, `user_interests`, `assessments`, `skills`, `interests`, `careers`, `career_skills`, `recommendations`, `roadmaps`+`roadmap_tasks`, `internships`, `resume_analyses`, `notifications`, `community_profiles/posts/comments/post_likes/post_bookmarks`, `github_analyses`. Storage bucket `resumes`.
- **Build/Tooling** `package.json:8` (oxlint), `vite.config.js:8` (react + tailwindcss), `.oxlintrc.json`, `vercel.json`, `scripts/setup-appwrite.mjs` + `seed-catalog.mjs`.

### Frontend architecture `src/`
- Components: `components/layout/` (TopBar, Footer, NotificationBell, CommunityFab), `components/common/` (RouteGuards, Icon, FieldError, ResumeSkeleton, DecorativeShapes), `components/community/` (5), `components/resume/` (ResumeEditor), `components/home/WhatWeDo`.
- Pages: `pages/public/Home.jsx`, `pages/auth/*` (4), `pages/private/*` (14), `pages/onboarding/` (wizard + 5 steps).
- Services: 12 Appwrite/API clients `src/services/*.js` (appwrite, api, auth, profile, skills, interests, assessment, careers, recommendations, roadmaps, github, resume, whatif, comparison, internships, community, notifications, streak, admin).
- Context/Hooks: `context/AuthContext.jsx`, `hooks/useAuth.js`, `hooks/useAdmin.js`, `hooks/useAvatarUrl.js`.
- Utils: `utils/validation.js`.

### Backend `server/src/`
- Controllers 6, Services 9 (`appwrite.service.js`, `career.service.js`, `recommendation.service.js`, `comparison.service.js`, `whatif.service.js`, `github.service.js:569`, `resume.service.js`, `roadmap.service.js`, `internship.service.js`, `community.service.js`, `notification.service.js`, `ai.service.js`), Routes 10, Middleware 3, Config 2.

### AI `ai-service/app/`
- `ai/client.py` — LLM gateway client (OpenAI-compatible, Qwen3.6-35B-A3B).
- `resume/` — ingest.py, pipeline.py, prompts.py, schema.py, scoring.py, latex/renderer.py + compile.py.
- Tests `tests/` — resume pipeline, schema, scoring, ingest, LaTeX, and AI client tests.

---

## 2. Feature Inventory

| Feature | Route(s) | Current Purpose | Actual Usage / Frequency | Status | Recommendation |
|---|---|---|---|---|---|
| Auth — Login/Signup/Forgot/Reset | `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password` `src/pages/auth/*` | Entry, session | High — every user | Active | **KEEP** — unify validation `src/utils/validation.js`, add rate-limit `server/src/app.js` |
| Onboarding wizard | `/onboarding` `src/pages/onboarding/Onboarding.jsx:34` 6 steps: education, academic, skills, interests, preferences, assessment | Build `profiles` + `user_skills` + `user_interests` + `assessments` | Once per user | Active but bloated | **REWORK** 6→3 (see §3) |
| EducationLevel standalone | `/onboarding/education-level` `src/pages/private/EducationLevel.jsx:1` | Change education level post-onboarding | Low | Redundant | **MERGE** into onboarding + `ProfileSettings.jsx` |
| Assessment | `/assessment` `src/pages/private/Assessment.jsx:1` | 10-Q questionnaire, `assessment_score` 0–100 | Low (retake) | Duplicate (also step 6) | **MERGE** keep as wizard sub-step + standalone retake only |
| Dashboard | `/dashboard` `src/pages/private/Dashboard.jsx:1` — streak, completion %, checklist, next-steps, 8 tool cards, skill chips | Hub after onboarding (gated by `ProfileCompleteRoute` `src/components/common/RouteGuards.jsx:42`) | High | Overloaded | **SIMPLIFY** 1 hero + 3 CTAs, remove duplicate checklist |
| Recommendations | `/recommendations` `src/pages/private/Recommendations.jsx:1` — list + `Generate recommendations` button `Recommendations.jsx:137` | Ranked careers vs hybrid score `server/src/services/scoring.js` §23 | High | Manual trigger | **IMPROVE** auto-generate on onboarding complete; inline gaps |
| Skill Gaps | `/skill-gaps`, `/skill-gaps/:careerId` `src/pages/private/SkillGaps.jsx:1` dropdown + strong/needs_improvement | Per-career gap analysis | High | Duplicates recommendation card | **MERGE** drawer/modal from card, deprecate standalone |
| Roadmaps | `/roadmaps`, `/roadmaps/:id` `src/pages/private/Roadmaps.jsx`, `RoadmapDetail.jsx` | Ordered tasks CRUD, reorder, progress `roadmap.service.js` | High | Core value | **KEEP** — add optimistic updates |
| GitHub Analysis | `/github` `src/pages/private/GitHubAnalysis.jsx:1` `server/src/services/github.service.js:525` | Public repos → languages/skills/domains/career matches | Medium | Has Node fallback but still calls `POST /ai/github/analyze` `github.service.js:506` | **REWORK** per user request — new contribution-style view, Node-only |
| Resume Analysis | `/resume` `src/pages/private/ResumeAnalysis.jsx:1` 702 loc, 5 steps `STEPS` `ResumeAnalysis.jsx:22` Extract→Analyze→Match→Optimize→Generate | 6-stage LLM pipeline `server/src/services/resume.service.js:480` + `ai-service/app/main.py:427-520` | Medium | High complexity | **REWORK** 6→2 stages, Match/Optimize optional |
| Career Compare | `/career-compare` `src/pages/private/CareerComparison.jsx:1` multi-select, side-by-side | Compare ≥2 careers `comparison.service.js:140` | Low | Niche | **DEFER** hide behind Recommendations action, not TopBar |
| What-If Simulator | `/what-if` `src/pages/private/WhatIfSimulator.jsx:1` skill+level builder → baseline vs simulated | Hypothetical re-score `whatif.service.js:169` | Low | Niche | **DEFER** secondary action only |
| Internships | `/internships` `src/pages/private/Internships.jsx:1` recommended + catalog, `internship.service.js` scoring 55/20/15/10 | Ranked internships; admin approval gate `AdminInternships.jsx` | Medium | Active | **KEEP** — add server pagination |
| Admin — Internships | `/admin/internships` `src/pages/private/AdminInternships.jsx:1` `server/src/routes/admin.routes.js` `requireAdmin` | Approve/reject/delete, `source_key` dedup, `expires_at` TTL | Low (admin only) | Active | **KEEP** move link to profile menu |
| Community | `/community`, `/community/saved`, `/community/drafts`, `/community/posts/:id`, `/community/users/:userId` `src/pages/private/Community*.jsx` `community.service.js:17619` | Posts/comments/likes/bookmarks, FAB `CommunityFab.jsx` | Medium | FAB+PressSection noise | **SIMPLIFY** remove FAB, remove `PressSection.jsx` placeholder |
| PressSection carousel | embedded in `Community.jsx` via `src/components/community/PressSection.jsx` | Hardcoded tech news auto-slide | Never (hardcoded, no API) | Placeholder | **REMOVE** or feature-flag |
| Community FAB | `src/App.jsx:13` `src/components/layout/CommunityFab.jsx` sticky bottom-right pill | Nav to community | Low | Non-standard | **REMOVE** — add to TopBar Explore |
| Notifications | `src/components/layout/NotificationBell.jsx` 45s polling, `notifications` collection, `notification.service.js:3687` | In-app inbox, admin broadcasts `POST /api/admin/notifications` | High | Polling wasteful | **IMPROVE** Appwrite Realtime |
| Streak | `src/services/streak.js` `touchStreak`, `TopBar.jsx:379` pill `🔥 {n} day streak`, `AuthContext.jsx:93` | Daily engagement counter | High | Keep | **KEEP** |
| ProfileSettings | `/settings` `src/pages/private/ProfileSettings.jsx:1` | Update profile fields | Low | Needed | **KEEP** merge education-level here |
| Homes | `/` public `src/pages/public/Home.jsx:41` + `/home` private `src/pages/private/Home.jsx:1` | Landing + logged-in landing | High | Duplicate | **MERGE** single conditional Home |
| TopBar Nav | `src/components/layout/TopBar.jsx:299` — Home, Dashboard, Explore(2), Growth(2), Tools(4), Admin | Global nav | High | Too many dropdowns | **SIMPLIFY** 3 hubs |

---

## 3. Workflow Problems

### 3.1 Onboarding
```
Current:  Sign up → /onboarding [Education] → [Academics] → [Skills] → [Interests] → [Preferences] → [Assessment] → /home
                resume at incomplete step (Onboarding.jsx:110) | each step can Skip
Problems:
- 6 pages/clicks for a once-per-lifetime flow; Skills & Interests are identical catalog pickers split in two.
- Preferences duplicates Goals already in profile (career_goal, preferred_role/industry/location/work_preference).
- AcademicStep auto-adds skills at proficiency 2 silently (Onboarding.jsx:173-199) — invisible side-effect, inflates skill count.
- Assessment is both step 6 and standalone /assessment — duplicate scoring path.
- EducationLevel standalone re-implements step 1 (EducationStep.jsx vs EducationLevel.jsx).

Proposed:  Sign up → /onboarding [Education] → [Skills & Interests — unified picker] → [Goals & Assessment — preferences + 10-Q]
          (3 steps, explicit "Add related skills" opt-in chips instead of silent auto-add)
```

### 3.2 Recommendations → Skill Gaps → Roadmap
```
Current:  Dashboard → /recommendations → [Generate recommendations] (manual) → cards → [View skill gaps] → /skill-gaps/:careerId → dropdown reselect career → [Generate roadmap] → /roadmaps
Problems:
- 3 manual generations; 2 navigations; SkillGaps dropdown re-asks what the card already knows.
- Recommendation, SkillGaps, Roadmap triple-fetch same profile + catalog.
- Fallback badge Estimated·AI offline shown per-card but logic duplicated 3 services.

Proposed:  Onboarding complete auto-generates recommendations (server hook, no button). Card shows inline top 2 gaps + [Create roadmap] directly.
          SkillGaps becomes drawer/modal within /recommendations (deep-link ?career= preserved for shareability but no standalone page).
          Roadmap generation from same profile snapshot; single CTA.
```

### 3.3 Resume (6-stage pipeline)
```
Current:  Upload (drag+drop) → Extract (/ai/resume/extract) → Edit ResumeEditor → Analyze (/ai/resume/analyze) → textarea jobDescription → Match (/ai/resume/match) → Optimize (/ai/resume/optimize) → Generate (/ai/resume/generate → LaTeX + optional PDF compile)
          State machine 5 steps (ResumeAnalysis.jsx:24, currentStep 0..4, 702 lines)
Problems:
- 6 states, 5 sequential 120s AI calls (resume.service.js:367 updatePipelineData → storage JSON file per stage), 5 blobs + pdf per analysis.
- Match is required before Optimize; user must paste JD even if they just want score + ATS export.
- Error handling scattered via run(label, fn) (ResumeAnalysis.jsx:126).

Proposed:  Upload → Edit → Analyze (+ overall score, section bars, missing_sections, ats_issues) → Export (.tex/.pdf)  [Tailor to job collapsed as optional accordion after Analyze]
          Consolidate pipeline blobs to 2 writes (resume_json + analysis_json); latex reuse existing renderer.
```

### 3.4 GitHub Analysis — REWORK (user-requested)
```
Current:  Input username → Node fetch GitHub API (fetchGitHubProfile/repos  github.service.js:186) → POST /ai/github/analyze (ai-service/app/github/analyzer.py) → fallback computeFallbackAnalysis (github.service.js:339) → save → profile page with languages bars + skill signals + domains + career_matches + strengths/next steps (GitHubAnalysis.jsx:176-360)
Problems:
- Calls ai-service even though all analysis is deterministic (languages, topics → skill/domain maps are static dicts LANGUAGE_TO_SKILL, TOPIC_TO_SKILL). Adds 20s timeout + fallback complexity.
- Career matches duplicate recommendation engine — not the user's requested view.
- UI mixes 6 unrelated sections; requested view is contribution-focused.

Requested view (screenshot — 2 images combined):
  Header "REFINED IN PRIVATE." — subtitle "A live view of contribution patterns, streaks, language focus, and development rhythm across GitHub."
  Box "GITHUB ACTIVITY_" — yearly contribution grid (Mon/Wed/Fri labels, Aug→Aug months, intensity Less→More).
  Stats Row 1 — 3-col: CURRENT STREAK / LONGEST STREAK / TOTAL CONTRIBUTIONS
  Stats Row 2 — 3-col: AVERAGE DAILY CONTRIBUTIONS / MOST ACTIVE DAY / MOST ACTIVE MONTH
  Stats Row 3 — 3×2 grid: TOP LANGUAGES (e.g. TypeScript / Python / JavaScript / CSS) / PUBLIC REPOSITORIES / PRIVATE REPOSITORIES
  Stats Row 4 — 3-col: FOLLOWERS / PULL REQUESTS / ISSUES OPENED
  Stats Row 5 — 1-col: CODE REVIEWS
  Footer: VIEW GITHUB PROFILE → (link to html_url)
  Note: Private repo count available only when GITHUB_TOKEN has access to the target user (otherwise show 0 or hide); PRs/Issues/Code Reviews via GitHub Search or GraphQL contributionsCollection — fallback 0 when unauthenticated.

Proposed — Node-only (no ai-service):
  Node fetch: users/:username, repos, events? or contribution calendar via GitHub GraphQL (contributionsCollection) — fallback to pushed_at heuristic if token missing; compute streaks/longest/total/avg/mostDay/mostMonth deterministically in Node; persist analysis_result sans AI; frontend renders new ContributionGrid component matching screenshot (monospace, bordered box, intensity 5 levels).
  Remove: requestAiAnalysis (github.service.js:503), ai-service endpoint POST /ai/github/analyze from call path, career_matches/domains/skills sections (keep optional "Skill signals" collapsed).
```

### 3.5 Community
```
Current:  FAB hover pill (CommunityFab.jsx) + TopBar hidden + /community → PressSection hardcoded carousel (auto-advance) + feed (category/sort/search/scope/offset/limit)
Problems:
- FAB breaks focus/a11y, duplicates nav; PressSection never hits API/collection — prototype placeholder shipped to prod; feed author resolution N+1 with 120s in-memory cache (community.service.js).
Proposed:  Remove FAB (src/App.jsx:13), add Community to TopBar Explore dropdown, delete or feature-flag PressSection.jsx, add cursor pagination + Realtime for comments.
```

### 3.6 Dashboard overload
```
Current:  Hero + streak + education/assessment chips → 4 StatCards → Profile setup 6-row checklist + progress bar → Suggested next 3 → Roadmap progress → 8 Tool Cards → Your skills chips (12) + links
Problems:
- Checklist duplicates onboarding; 8 cards compete with TopBar nav; skills chips slice(0,12) hide overflow; 3 data fetches without SWR (Dashboard.jsx:117).
Proposed:  Hero + 1 progress bar + 3 primary CTAs (View matches / Continue roadmap / Complete profile) + optional 4-feature grid max. Move checklist to onboarding only.
```

---

## 4. Technical Problems

### Frontend `src/`
- No code-splitting: `AppRoutes.jsx:3-28` eager imports all 20 pages → large bundle, no `React.lazy`/`Suspense`.
- JWT per request: `src/services/api.js:8` `account.createJWT()` on every axios request (~100-200ms extra, no cache).
- Duplicate state: `AuthContext.jsx:36-54` boot fetches user then profile; `Dashboard.jsx:117` refetches skills/interests/roadmaps without cache/SWR; `useAdmin` refetches `/api/admin/me` separately.
- Duplicated components: `NavDropdown` vs `MobileMenu` in `TopBar.jsx:10` share logic; `TopBar` + `CommunityFab` duplicate nav concerns.
- Vite config minimal `vite.config.js:8` — no `manualChunks`, no `strictPort` handling beyond README note.
- Auth context `touchStreak` `AuthContext.jsx:93` fire-and-forget with stale `streak.current 0` reset.
- Inconsistent UX tokens: `btn-primary`/`btn-secondary`/`chip` usage varies; `DecorativeShapes` purely visual but no `aria-hidden`; `ProfileMenu` missing `aria-describedby` on errors.
- Missing lazy/hydration: No `loading.tsx` skeletons unified; `ResumeSkeleton.jsx` only for resume, not general.

### Backend `server/src/`
- Fallback logic duplicated 4×: `recommendation.service.js:123 computeFallbackRecommendations`, `comparison.service.js:75 computeFallbackComparison`, `whatif.service.js:101 computeFallbackWhatIf`, `github.service.js:339 computeFallbackAnalysis`, `resume.service.js:199 computeFallbackAnalysis` — same `normalizeName`/`confidenceToProficiency` repeated.
- N+1 reads: `community.service.js` author resolution `Users.get` per post (120s cache band-aid); `roadmap.service.js` sequential task updates.
- Timeout mismatch: `ai.service.js:4 AI_TIMEOUT_MS 15000` vs `resume.service.js:6 AI_TIMEOUT_MS 30000` vs pipeline `120000` — inconsistent fallback to `503 AI_SERVICE_UNAVAILABLE` vs `AI_TIMEOUT`.
- Validation scattered: Each service re-implements `normalizeSkillName`, `buildGoals`, `buildUserProfile` (identical 6 lines across recommendation/comparison/whatif).
- Indexes missing: `community_posts(status, created_at)`, `roadmap_tasks(roadmap_id, order)`, `internships(status, expires_at)` — pagination `offset/limit` without cursor will degrade.
- Dead file: `server/.tmp-test-roadmap2.mjs` checked in.
- Error middleware `server/src/middleware/error.middleware.js` may leak stack in production (check `process.env.NODE_ENV`).
- Resume pipeline storage: Each stage creates new file `ID.unique()` and deletes old `data_file_id` (`resume.service.js:334-355`) — 5 writes per analysis, orphan risk on crash; `MAX_PIPELINE_BLOB_CHARS 60000` validated in Node but not Python.
- Security: Admin = `ADMIN_EMAILS` allowlist only (no role doc); no rate-limit on `/api/auth`/`/api/admin/**`/`/api/resume/analyze`/`/api/github/analyze`; `resumes` bucket `create("users")` allows unbounded upload (only 5MB size check).

### AI Service `ai-service/app/`
- Resume-only: 5 LLM endpoints + `/health`. No recommendation, GitHub, or legacy endpoints remain.
- No rate-limit; exception handler maps `AIConfigurationError→503` etc (`ai-service/app/main.py:51`) but Node `ai.service.js` treats all 5xx as `AI_SERVICE_UNAVAILABLE` — lossy.
- Tests `ai-service/tests/` cover resume pipeline, schema, scoring, ingest, LaTeX, and AI client.

### Database / Appwrite
- `resume_analyses` indirection via `data_file_id` avoids row-size cap (correct) but requires orphan GC; `analysis_result` column still kept for legacy (`resume.service.js:419`).
- `career_skills` `required_level`/`importance` 1-5 scale changed — seed script `scripts/seed-catalog.mjs` now updates existing docs, but old indexes may retain stale values.
- `notifications` `actor_id,post_id` marker + `user_actor_post_idx` added late — check existing indexes.

### Security & Accessibility
- Client `useAdmin` trusts `/api/admin/me` `is_admin` but server `requireAdmin` re-checks email — correct, but admin UI still renders link before check (flash).
- `MobileMenu` locks body `overflow hidden` but no focus trap.
- Contrast: `brand-deep` on `brand-soft` passes, but `text-ink-muted` on `surface-soft` borderline WCAG AA.
- Mobile: TopBar `h-20` + FAB + `max-w-7xl` ok, but `gitHubActivity` grid will need horizontal scroll on mobile.

### Dependencies / Dead Code
- Frontend deps 7, devDeps 4 — `axios` used but could be `fetch`; `appwrite` 26.x correct; no unused major dep detected beyond `PressSection` placeholder data.
- Backend `node-appwrite` 27.x, `express`, `cors` — minimal.
- Unused: `CommunitySaved/Drafts/UserProfile` pages low traffic but keep.

---

## 5. Proposed Product Changes

### 5.1 Global IA & Navigation (P1)
- Collapse `TopBar.jsx:299` `navItems` 4 dropdowns → 3 hubs: `Discover` (Matches, Gaps, Compare, What-If), `Build` (Roadmap, Resume, GitHub), `Opportunities` (Internships, Community). Move Admin from top-bar to profile menu `ProfileMenu` `TopBar.jsx:70`.
- Delete `CommunityFab.jsx` + `src/App.jsx:13` import. Add Community link to TopBar `Explore`.
- Merge homes: `src/pages/public/Home.jsx` + `src/pages/private/Home.jsx` → single `src/pages/Home.jsx` with `useAuth()` conditional CTA.
- Add `React.lazy()` for all private routes in `AppRoutes.jsx`, `Suspense` fallback, `vite.config.js` `build.manualChunks` for `vendor` + `resume` chunk.

### 5.2 Onboarding Rework (P1)
- `src/pages/onboarding/Onboarding.jsx` `STEPS 6` → `STEPS 3`:
  1. Education (keep `EducationStep.jsx`)
  2. Skills & Interests (merge `SkillsStep.jsx:1` + `InterestsStep.jsx:1` — single catalog search + chips)
  3. Goals & Assessment (merge `PreferencesStep.jsx:1` + `AssessmentStep.jsx:1`)
- Remove silent auto-add `Onboarding.jsx:173` `setSkillProficiency proficiency 2`; replace with explicit "Suggested from your studies — Add all" chips.
- Keep `academicComplete`/`preferencesComplete` helpers but consolidate into one resolver.
- Delete standalone `/onboarding/education-level` route or make it redirect to `/settings` tab.

### 5.3 Recommendations Journey (P1)
- On `completeOnboarding` `Onboarding.jsx:283` call `POST /api/recommendations/generate` automatically (server hook or frontend sequential after `completeOnboarding` succeeds — no user button).
- `Recommendations.jsx:137` `Generate recommendations` becomes secondary "Regenerate" only.
- SkillGaps: Convert `SkillGaps.jsx` to drawer component `<SkillGapDrawer careerId>` used inline in `Recommendations.jsx:71` card; preserve deep-link `?career=xyz` query param for shareability but remove dedicated page route after search confirms no external deep-links.
- Roadmap: Card CTA `View skill gaps` → `View gaps & create roadmap` → `POST /api/roadmaps` directly with `analyzeCareerGaps` already available.

### 5.4 Dashboard Simplification (P1)
- Keep `Dashboard.jsx:204` hero (welcome + streak + education label) but remove duplicate 6-row checklist detail; replace with single progress bar + 3 CTAs.
- Keep 4 `StatCard` but remove `Best streak` duplicate (already in hero). Show `Profile setup %`, `Skills`, `Roadmap progress`.
- Reduce `TOOL_CARDS 8` `Dashboard.jsx:13` → 4 max (Career Match, Roadmap, Resume, Internships). Other tools reachable via TopBar hubs.
- Keep `Your skills` chips section but add `+N more` link to onboarding Skills step, not modal.

### 5.5 GitHub Analysis — New Spec (P1, Node-only, per user request)

**Goal:** Match screenshot: contribution rhythm, not career-match.

**Backend `server/src/services/github.service.js`:**
- Remove `requestAiAnalysis` `github.service.js:503` and `POST /ai/github/analyze` call path.
- Keep `fetchGitHubProfile`/`fetchGitHubRepos` (`github.service.js:186`) but add: `fetchGitHubContributions(username)` → GitHub GraphQL `contributionsCollection` (requires `GITHUB_TOKEN` if available; else fallback to `pushed_at` heuristic already in `detectActivity`).
- Add pure-Node helpers: `buildContributionGrid({contributions})` → `Array<{date, count, level 0..4}>` 52 weeks × 7, `computeStreaks(grid)` → `current/longest`, `computeTotals`, `avgDaily`, `mostActiveDayOfWeek`, `mostActiveMonth`.
- `computeFallbackAnalysis` → `computeGitHubDashboard` returning `{ profile, summary, activity, contributions, stats: {currentStreak, longestStreak, totalContributions, avgDaily, mostActiveDay, mostActiveMonth} }`.
- Persist same `analysis_result` JSON shape (backward compat) but source always `node` (not `ai`/`fallback`).
- No `career_matches`/`domains`/`open_source` needed; keep `languages`/`skills` as optional collapsed section.

**Frontend `src/pages/private/GitHubAnalysis.jsx`:**
- Replace `Stat`/`LanguageBar`/career_matches grid with spec layout (site UI — same colors/fonts/cards as Dashboard/Resume, not screenshot monospace):
  - Header: `REFINED IN PRIVATE.` (`h1 font-black tracking-tight`), subtitle `A live view of contribution patterns, streaks, language focus, and development rhythm across GitHub.` (site `text-ink-muted`).
  - Box: `GITHUB ACTIVITY_` card with months row (Aug→Aug), Mon/Wed/Fri labels, grid cells `h-3 w-3 rounded-sm` intensity 5 levels using site palette (`bg-brand` scale or `surface-strong`→`brand-deep`), footer `N contributions in the last year` + legend `Less [5 swatches] More`.
  - Stats Row 1: 3-col cards `CURRENT STREAK` / `LONGEST STREAK` / `TOTAL CONTRIBUTIONS` (large `text-2xl font-black`)
  - Stats Row 2: 3-col cards `AVERAGE DAILY CONTRIBUTIONS` / `MOST ACTIVE DAY` / `MOST ACTIVE MONTH`
  - Stats Row 3: 3-col cards `TOP LANGUAGES` (slash-separated, e.g. TypeScript / Python / JavaScript / CSS, computed via existing `languageShare` `github.service.js:204`) / `PUBLIC REPOSITORIES` (from `profile.public_repos`) / `PRIVATE REPOSITORIES` (from GraphQL `totalPrivateContributions` or `ownedPrivateRepos` when GITHUB_TOKEN present, else 0)
  - Stats Row 4: 3-col cards `FOLLOWERS` / `PULL REQUESTS` / `ISSUES OPENED` (PRs/issues via GraphQL `pullRequestContributions`/`issueContributions` or REST `search/issues?q=author:username+type:pr/issue`)
  - Stats Row 5: 1-col card `CODE REVIEWS` (via `pullRequestReviewContributions`)
  - Footer: `VIEW GITHUB PROFILE ↑` link to `profile.html_url` (`github.service.js:385`).
- Create `src/components/github/ContributionGrid.jsx` for the yearly grid; props `contributions` array.
- Keep `username` input + `applySkills` checkbox but checkbox now collapsed under "Add detected languages to profile" (optional).
- Handle states: loading skeleton, empty (no repos), rate-limit 429 `GITHUB_RATE_LIMITED`, private count hidden when token missing.

**Verification:** Remove `ai-service/app/github/analyzer.py` from call path (keep file for archive but no traffic); keep `ai-service/app/main.py:406 github_analyze` endpoint but it will receive no Node calls.

### 5.6 Resume Rework (P2)
- `src/pages/private/ResumeAnalysis.jsx:22` `STEPS 5` → `STEPS 2`: `[Upload & Edit]` + `[Analyze & Export]`.
- Fold `JobMatchCard`/`MiniList` for jobDescription into optional `<TailorToJobAccordion>` after `analysis` exists (currently `Match` is required gate for `Optimize` `ResumeAnalysis.jsx:596`).
- Consolidate `resume.service.js:316 updatePipelineData` writes: Extract + Analyze share one file, Tailor writes patch, Generate writes `latex_source`. Or keep but ensure `MAX_PIPELINE_BLOB_CHARS` checked server-side only.
- No AI removal here — LLM `extract/analyze/match/optimize` still need `ai-service/app/main.py:427-490` + `app/ai/client.py`. Keep pipeline.

### 5.7 Community Simplification (P2)
- Delete `src/components/community/PressSection.jsx` (hardcoded carousel) or gate `if (import.meta.env.VITE_ENABLE_PRESS === 'true')`.
- Delete `src/components/layout/CommunityFab.jsx`, remove from `src/App.jsx:13`.
- Add `Community` to TopBar `Explore` items `TopBar.jsx:303`.
- Keep `community.service.js` like/bookmark toggles; add cursor-based pagination `cursor` param instead of `offset/limit` only.

### 5.8 Cross-cutting Frontend (P1/P2)
- `src/services/api.js:8` — cache JWT: `let jwtCache = {token, exp};` reuse until 60s before Appwrite `jwt.exp` (decode payload). Fallback to fetch on 401.
- `src/routes/AppRoutes.jsx` — `const Dashboard = lazy(() => import('../pages/private/Dashboard'))` etc + `<Suspense fallback={<PageSkeleton/>}>`.
- NotificationBell: replace `setInterval 45s` polling with `client.subscribe('databases.*.collections.notifications.documents')` Realtime.

### 5.9 Backend & DB (P0/P1)
- P0: Add `express-rate-limit` to `server/src/app.js` for `/api/github/analyze`, `/api/resume/*`, `/api/admin/*`.
- P1: Unify `buildUserProfile`/`skillNameMap`/`interestNameMap`/`normalizeSkillName` into `server/src/services/profile.builder.js` shared util — remove 3 duplicates.
- P1: Create indexes (via `scripts/setup-appwrite.mjs`): `roadmap_tasks` `(roadmap_id, order)`, `community_posts` `(status, created_at desc)`, `internships` `(status, expires_at)`.
- P1: Dedup fallback scorers into `server/src/services/scoring.fallback.js` — single `scoreFallback(profile, catalog)` used by recommendation/comparison/whatIf.
- P2: Delete `server/.tmp-test-roadmap2.mjs`.
- P2: Orphan GC: cron to delete `resumes` bucket files where `data_file_id` no longer referenced.

---

## 6. Where ai-service Is Used Today vs What Can Move to Node (Requested)

| Current ai-service Endpoint | Caller `server/src/` | Uses LLM? | Can Move to Node? | Rationale | Action |
|---|---|---|---|---|---|
| `POST /ai/resume/extract` `ai-service/app/main.py` `extract_resume` + `ingest.py` + LLM `app/ai/client.py` | `resume.service.js` `requestPipeline /extract` | **YES — LLM extraction to structured Resume JSON** `EXTRACTION_PROMPT_VERSION` | **NO** | Needs `app/ai/client.py` gateway → LLM. Keep. | Keep ai-service. |
| `POST /ai/resume/analyze` `ai-service/app/main.py` `pipeline.py:ai_analyze_resume` | `resume.service.js` | **YES — semantic analysis + deterministic scoring** | **NO** | LLM semantics then local weighting. Keep. | Keep. |
| `POST /ai/resume/match` `ai-service/app/main.py` `match_job` | `resume.service.js` | **YES — JD matching** `MATCH_PROMPT_VERSION` | **NO** | LLM. Keep. | Keep. |
| `POST /ai/resume/optimize` `ai-service/app/main.py` `optimize_resume` | `resume.service.js` | **YES — wording optimization** `OPTIMIZATION_PROMPT_VERSION` | **NO** | LLM, never invents facts. Keep. | Keep. |
| `POST /ai/resume/generate` `ai-service/app/main.py` `render_resume` + `compile_pdf` `latex/renderer.py` | `resume.service.js` | **NO** — deterministic Jake LaTeX `RENDERER_VERSION` + optional `pdflatex` compile | **YES (optional)** | Renderer is pure string templating; compile needs local `pdflatex` but file-gen could run in Node with same template. Currently ai-service already does it; moving to Node saves one AI slot but not critical. | **Candidate for later Node move** (P3); keep on ai-service for now unless you want it on Node too. |

**Summary:** All 5 remaining ai-service endpoints use LLM (`extract/analyze/match/optimize`) or are tightly coupled to Python (`generate`). The recommendation, GitHub, skill-gaps, compare, what-if, careers, and legacy analyze-legacy endpoints have been removed — those features are now fully Node-native.

---

## 7. Implementation Priority

### P0 — Critical (security, breakage, data)
- JWT cache `src/services/api.js:8` (reuse until exp, fix per-request latency/rate-limit).
- Rate-limit `server/src/app.js` (`/api/github/analyze`, `/api/resume/*`, `/api/admin/*`).
- Verify `resumes` bucket quota/orphan risk; no destructive DB migration (indexes additive only).
- Check `server/src/middleware/error.middleware.js` leak stack, `auth.middleware.js:14 setJWT` expiry handling.

### P1 — High (major UX)
1. **Onboarding 6→3** + silent auto-add removal.
2. **Recommendations auto-generate** + SkillGaps drawer.
3. **TopBar IA** (3 hubs, remove FAB, merge Homes) + lazy routes + `NotificationBell` Realtime.
4. **Dashboard simplify** (1 progress + 3 CTAs, reduce 8 cards→4).

### P2 — Medium (maintainability, simplification)
- Resume 5→2 stages, Tailor accordion (`ResumeAnalysis.jsx:24`).
- Community PressSection/FAB removal, cursor pagination.
- Unify fallback scorers, delete `server/.tmp-test-roadmap2.mjs`, add orphan GC.
- Add indexes via `scripts/setup-appwrite.mjs` idempotently, rerun `seed:catalog`.

### P3 — Low (cosmetic, perf polish)
- `ai-service/app/resume/latex` renderer move to Node `server/src/services/latex.service.js` if you want full Node resume export.
- Bundle `manualChunks`, empty/loading/skeleton unification, a11y passes (`DecorativeShapes` `aria-hidden`, `FieldError` `aria-describedby`), contrast tweaks.

---

## 8. Risks & Dependencies

- **Deep-link breakage:** `Recommendations.jsx:71` `Link to=/skill-gaps/:careerId` — after drawer migration add redirect `Navigate to=/recommendations?career=xyz` to preserve share links.
- **Onboarding data:** Removing silent skill auto-add does not delete existing skills; users keep current `user_skills` docs — no migration.
- **Resume pipeline compat:** `toAnalysisDto` `resume.service.js:700` handles both `resume_json` blob + legacy `analysis_result`; consolidating blobs must keep that DTO — otherwise old analyses 404.
- **GitHub GraphQL:** Requires `GITHUB_TOKEN` `server/.env` for `contributionsCollection`; fallback to `pushed_at` heuristic already supports token-less mode but accuracy drops — document in `docs/main_architecture.md` §42.
- **ai-service shutdown risk:** After P1, Node must return `source: "node"` not `"ai"`/`"fallback"` — frontend badge `Estimated · AI offline` (`Recommendations.jsx:29`) should change to no badge when source is `node` (deterministic = full).
- **Commit discipline:** No commits/pushes or subscription purchases per your rule until you approve each increment. This doc itself is not committed until you say so.
- **Build-before-merge:** Each increment: `npm run lint` (`oxlint`), `vite build`, `server` health `GET /`, `ai-service` `pytest` for remaining resume endpoints, smoke: signup → 3-step onboarding → dashboard → recommend drawer → roadmap CRUD → resume upload/analyze → internships → github new view.

---

## 9. Next Step (awaiting approval)

> Do not start P1 without explicit go-ahead. Suggested order if you approve: **GitHub Node-only (§5.5)** first (isolated, per your screenshot), then **scoring endpoints Node-only** (recommend/skill-gaps/compare/what-if), then onboarding/nav.

Approval prompt: Reply `approve P1 GitHub` to start only the GitHub redesign, or `approve all P1` for the full high-priority batch. Any purchase/subscription will be asked for separately.

