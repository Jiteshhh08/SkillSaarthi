# Development Rules — skillsaarthi

> Rules and conventions for the skillsaarthi team.
>
> **Product:** One-Stop Personalized Career & Education Advisor
>
> Related documents: [`PRD.md`](PRD.md) (product requirements) · [`main_architecture.md`](main_architecture.md) (architecture)

---

# 1. Project Overview

skillsaarthi is a personalized career and education guidance platform.

It helps students, learners, and job seekers:

- Understand which careers suit them
- See their skill gaps
- Follow a personalized learning roadmap
- Track their progress
- Get course, project, and internship recommendations

The product is built around one central loop:

```text
UNDERSTAND USER
      ↓
RECOMMEND CAREER
      ↓
IDENTIFY GAPS
      ↓
CREATE ROADMAP
      ↓
LEARN & BUILD
      ↓
TRACK PROGRESS
      ↓
UPDATE RECOMMENDATIONS
```

---

# 2. Technology Stack

## Frontend (repo root)

* React
* JavaScript
* Tailwind CSS
* React Router
* Axios (Node backend calls)
* Appwrite Web SDK (client-safe)

## Infrastructure & Data

* Appwrite Authentication
* Appwrite Databases (primary data store — NoSQL)
* Appwrite Storage
* Appwrite Messaging
* Appwrite Realtime

## Backend (server/)

* Node.js
* Express
* Appwrite server SDK (Admin API)

## AI / ML (ai-service/)

* Python
* FastAPI
* Pandas
* NumPy
* Scikit-learn
* Optional LLM integration

## Development

* Git
* GitHub

---

# 3. Architecture Rules

Read [`main_architecture.md`](main_architecture.md) for the full architecture.

Core rules:

```text
React handles presentation.
Appwrite handles auth + primary data + infrastructure.
Node.js handles business logic and orchestration.
Python handles AI/ML processing.
```

- **There is no MySQL.** Appwrite Databases is the primary data store.
- The frontend calls Appwrite directly for auth, database reads/writes, storage, and realtime.
- The frontend calls the Node backend only for business logic and AI orchestration.
- Authentication is handled by Appwrite Auth. **Do not store passwords or hash passwords in application code.**
- The Python service must not handle authentication.
- Business-critical logic must not live in the frontend.

---

# 4. Repository Structure

```text
skillsaarthi/
│
├── src/                      # React frontend (repo root)
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   └── private/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── routes/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.js
│   └── package.json
│
├── ai-service/               # Python AI/ML service
│   ├── app/
│   ├── models/
│   ├── data/
│   └── requirements.txt
│
├── docs/
│   ├── PRD.md
│   ├── main_architecture.md
│   └── rules.md
│
├── .env
├── .env.sample
├── .gitignore
├── vite.config.js
├── package.json
└── README.md
```

The frontend lives at the repo root. `server/` and `ai-service/` are separate applications.

---

# 5. Environment Variables

Copy `.env.sample` to `.env` and fill values. Never commit real secrets.

## Frontend (repo root `.env`)

```env
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_RESUME_BUCKET_ID=
# Free plan allows one bucket — reuse the resume bucket (which also accepts images).
VITE_APPWRITE_AVATAR_BUCKET_ID=resumes
VITE_API_BASE_URL=
```

Only client-safe values use the `VITE_` prefix.

## Node Backend (`server/.env`)

```env
PORT=5000
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=
AI_SERVICE_URL=http://localhost:8000
GITHUB_TOKEN=
LLM_API_KEY=
```

## Python AI Service (`ai-service/.env`)

```env
PORT=8000
LLM_API_KEY=
```

---

# 6. Appwrite Conventions

## Collections

Appwrite Databases collections are the app's tables. See `main_architecture.md` section 17 for the full list.

Naming conventions:

- Collection names: `snake_case`, plural (`user_skills`, `career_recommendations`, `roadmap_tasks`).
- Attribute names: `snake_case`.
- Foreign references: `_id` suffix, e.g. `user_id`, `career_id`, `skill_id`, `roadmap_id`.
- The `profiles` document ID equals the Appwrite user `$id`.

## Permissions

- User-scoped collections (`profiles`, `user_skills`, `roadmaps`, etc.): user can read/write only their own documents.
- Global catalogs (`skills`, `careers`, `courses`, `internships`): read-only for authenticated users.

---

# 7. API Conventions (Node Backend)

Base URL: `http://localhost:5000/api`

- Use REST conventions.
- All routes except health checks require an Appwrite session token (`Authorization: Bearer <jwt>`).
- Response format:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "...", "code": "ERROR_CODE" }
```

- Validate all inputs.
- Never expose internal error details.
- Handle AI service failures gracefully (see `main_architecture.md` section 42).

Key routes (full list in `main_architecture.md` section 32):

```text
/api/profile
/api/careers
/api/recommendations
/api/roadmaps           + /api/roadmaps/:id/tasks (incl. batch reorder PUT with { order: [taskId, …] })
/api/resume
/api/github
/api/what-if
/api/courses
/api/internships
/api/admin            (incl. POST /api/admin/notifications — single user or broadcast)
/api/assistant
/api/notifications    (inbox read via the Appwrite client SDK; server/admin create via notification.service.js)
```

## Hybrid Internship Catalog (workflow)

Internships are **never published automatically** — imported rows land as `pending`
and must be approved by an admin.

**1. Collect** — the scheduled importer reads a JSON feed, dedups by `source_key`
(`<source>:<title>:<company>`), sets `expires_at` (default 30d), and marks new
rows `pending`. Re-imports refresh existing rows and keep their status.

```bash
npm run import:internships                          # default: scripts/feeds/internships.json
npm run import:internships -- --dry-run             # fetch + report without writing
npm run import:internships -- --source remotive     # pull from the Remotive API instead
```

Feed format (`scripts/feeds/internships.json`):

```json
[
  {
    "title": "Software Engineering Intern",
    "company": "Example Inc",
    "location": "Remote",
    "description": "…",
    "url": "https://example.com/careers/intern",
    "skills": ["JavaScript", "React", "Node.js"]
  }
]
```

Importer env (in `scripts/.env.setup`, all optional — defaults shown):

```env
SOURCE=file             # file (JSON feed) or remotive (API)
FEED_FILE=              # path to the JSON feed (default: scripts/feeds/internships.json)
INTERNSHIP_TTL_DAYS=30  # how long imported listings stay visible before auto-expiring
IMPORT_MAX=50           # max openings imported per run
```

**2. Approve** — the admin API is disabled until `ADMIN_EMAILS` is set in
`server/.env` (comma-separated emails; empty = disabled). Sign in with an
authorized email, then open `/admin/internships` to approve (`active`), reject
(`rejected`), or delete rows, or add one manually (created `pending`).

**3. Auto-expire** — the public `GET /api/internships` returns only `active`
rows whose `expires_at` has not passed, so stale listings drop out without
manual cleanup.

---

## Notifications & Streaks

### Notifications

- In-app notifications live in the `notifications` collection, **one document per
  recipient**, each with `Permission.read/update/delete(Role.user(userId))` so users
  only ever see their own inbox.
- **Create** server-side or admin-side only (`server/src/services/notification.service.js`):
  `notify(userId, title, message)` for one user, `notifyAllUsers(title, message)` to broadcast
  (pages through `profiles` with `Query.limit(100)`/`offset`).
- **Read** from the frontend via the Appwrite client SDK (`src/services/notifications.js`):
  `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `timeAgo`.
- System notifications fire when a recommendation or roadmap is generated; admins can
  broadcast from the admin page (`POST /api/admin/notifications`, `{ title, message, email? }` —
  blank recipient = broadcast; `email` is resolved to the Appwrite account `$id`, which requires
  the API key to have the `users.read` scope).
- UI: `src/components/layout/NotificationBell.jsx` in the TopBar — unread badge, dropdown
  inbox, mark-all-read, 45s polling.

### Streaks

- Daily-activity counters live on `profiles`: `current_streak`, `best_streak`, `last_active_date` (`YYYY-MM-DD`).
- `touchStreak(userId)` (`src/services/streak.js`) — no change if already visited today,
  `+1` if last visit was yesterday, otherwise reset to `1`; `best` is always `max(best, current)`.
- `AuthContext` touches the streak once per mount and exposes `{ current, best }` to the
  TopBar pill and Dashboard; log out resets the in-memory streak to `{ 0, 0 }`.

---

# 8. Git Workflow

Use feature branches.

```text
main
 │
 ├── feature/authentication
 ├── feature/dashboard
 ├── feature/career-recommendation
 ├── feature/roadmap
 └── feature/resume-analysis
```

Basic workflow:

```bash
git checkout -b feature/<feature-name>

git add .

git commit -m "feat: add <feature>"

git push origin feature/<feature-name>
```

Then create a Pull Request.

Rules:

- The `main` branch must remain stable.
- Do not push directly to `main`.
- Do not commit secrets or `.env` files (`.env` is gitignored).
- Rebase or merge with `main` before creating a PR if behind.

---

# 9. Commit Conventions

Use Conventional Commits:

```text
feat: add skill gap analysis
fix: correct roadmap progress calculation
docs: update API documentation
refactor: extract recommendation service
chore: update dependencies
test: add recommendation engine tests
```

---

# 10. Code Standards

## General

- Follow existing code style in the repo.
- Do not add unnecessary comments.
- Run the linter before committing: `npm run lint` (oxlint).
- Keep components and files small and focused.

## Frontend

- Put reusable UI in `src/components/common/`.
- Put feature pages in `src/pages/`.
- Keep Appwrite and API logic in `src/services/` (`appwrite.js`, `api.js`, `auth.js`).
- Use React Router for navigation; protected routes for private pages.
- Never store server secrets in the frontend.
- Admin users (in `ADMIN_EMAILS`) bypass the student onboarding gate: signup sends them to
  `/home`, and `ProfileCompleteRoute` skips the `onboarding_completed` redirect for admins
  (`useAdmin` caches the `/api/admin/me` result per user so the UI doesn't flash between
  admin/non-admin views).

## Backend

- Follow the structure in `main_architecture.md` section 15.
- Controllers handle HTTP concerns; services contain business logic.
- Middleware handles auth, validation, and errors.
- Use the Appwrite server SDK with the API key for server-side operations.
- Every Appwrite call is a network round-trip — parallelize independent reads/writes with
  `Promise.all`, avoid redundant refetches (return detail from in-memory state after a
  mutation), and prefer one batch call over N sequential calls (e.g. roadmap reorder is a
  single `PUT /api/roadmaps/:id/tasks` with the full ordered id list).
- Derived state is recomputed server-side and persisted (e.g. `roadmaps.progress_percent`),
  including invariants like "a completed roadmap reverts to active when progress drops below
  100%".

---

# 11. Development Workflow

Start locally:

```text
1. Appwrite (cloud console or local instance) — create project, database, collections
2. Node backend: cd server && npm install && npm run dev
3. Python AI service: cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload
4. Frontend: npm install && npm run dev
```

Frontend runs at `http://localhost:5173` (Vite default).

Run the AI service tests (from `ai-service/`):

```text
cd ai-service && python -m pytest     # 44 tests: scoring, skill-gaps, resume, comparison, what-if
```

---

# 12. Development Phases

| Phase | Focus |
|---|---|
| 1 — Foundation | Repo setup, React, Appwrite Auth, Appwrite Databases, Node backend |
| 2 — Profile | Education selection, onboarding, skills, interests, preferences, assessment |
| 3 — Career Engine (complete) | Career/skill datasets, career-skill mapping, recommendation engine, skill-gap, explanations |
| 4 — AI (complete) | Python/FastAPI skill matching, ranking, skill-gap (pytest suite + Node fallback scorer) |
| 5 — Roadmap (complete) | Roadmap generator from skill gaps, tasks, progress tracking, dashboard wiring |
| 6 — Advanced | Resume analysis (implemented), GitHub analysis (implemented), career comparison (implemented), what-if simulator (implemented), AI assistant |
| 7 — Integrations | Courses, internships (implemented), notifications (implemented) |

---

# 13. Security Rules

- Passwords are handled by Appwrite Auth only.
- All private APIs require authentication.
- Users can only access their own private data.
- Validate and sanitize all inputs.
- Secrets live in environment variables, never in code or Git.
- The frontend must never contain the Appwrite API key, GitHub token, or LLM key.
- Resume files are handled through Appwrite Storage with restricted permissions.
- Only publicly accessible GitHub data is analyzed.

---

# 14. Build One Coherent Product

> **Build one coherent product, not six separate mini-projects.**

Every feature must strengthen the central product loop. Do not build isolated features that do not feed back into the user's profile, recommendations, or roadmap.

---

# 15. Production Hosting

## Live services

| Service | Platform | URL |
| --- | --- | --- |
| Frontend | Vercel | `https://skillsaarthi.vercel.app` |
| Backend | Render | `https://skillsaarthi-node.onrender.com` |
| AI service | Render | `https://skillsaarthi-f14x.onrender.com` |
| Appwrite | Appwrite Cloud | `https://cloud.appwrite.io` |

## Hosting rules

- The AI service must run **Python 3.12** — set the `PYTHON_VERSION=3.12.10` env var on Render.
  The pinned AI dependencies (`pandas 2.2.3`, `numpy 2.2.1`, `scikit-learn 1.6.0`, `pydantic 2.10.4`)
  have no prebuilt wheels for Render's default Python 3.14, and the source build fails.
- Backend start command: `npm start` (root directory `server`).
- AI start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (root directory `ai-service`).
- `PORT` is injected by the platform — never hardcode 5000/8000 in production environment settings.
- The AI service is reached by the backend through `AI_SERVICE_URL=https://skillsaarthi-f14x.onrender.com`.
- The frontend calls the backend through `VITE_API_BASE_URL=https://skillsaarthi-node.onrender.com`.
- The frontend origin must be added under **Appwrite → Settings → Platforms** (Web App),
  otherwise email/password auth breaks in production.
- Never commit `.env` or real secrets; set them only in the Vercel/Render dashboards.
- All user data persists in Appwrite Cloud — the stateless Node/Python services can be redeployed freely.
