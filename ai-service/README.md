---
title: Skillsaarthi AI Service
emoji: 🎓
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
base_path: /docs
pinned: false
---

FastAPI resume-intelligence service used by the skillsaarthi Node backend
(server-to-server; not called from the browser).

Endpoints:

- `GET /health`
- `POST /ai/resume/extract`
- `POST /ai/resume/analyze`
- `POST /ai/resume/match`
- `POST /ai/resume/optimize`
- `POST /ai/resume/generate`
- `POST /ai/assistant/chat`

Configuration is provided through Space secrets (never committed):

- `AI_BASE_URL` — OpenAI-compatible gateway
- `AI_MODEL` — model name
- `AI_KEY` — gateway key

`PORT` is fixed to `7860` in the Dockerfile to match the Space `app_port`.
