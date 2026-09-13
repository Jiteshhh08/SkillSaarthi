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

- `AI_BASE_URL` — OpenAI-compatible gateway (e.g. `https://ai.tcetcercd.in/v1`)
- `AI_MODEL` — model name (e.g. `Qwen3.6-35B-A3B`)
- `AI_KEY` — gateway key

The container listens on `7860` by default to match the Space `app_port`, and
honors a `PORT` env var if one is injected (Cloud Run, Container Apps, etc.).
