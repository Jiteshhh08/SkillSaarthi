# skillsaarthi AI service

FastAPI resume-intelligence service used by the skillsaarthi Node backend
(server-to-server; not called from the browser).

Endpoints:

- `GET /`
- `GET /health`
- `POST /ai/resume/extract`
- `POST /ai/resume/analyze`
- `POST /ai/resume/match`
- `POST /ai/resume/optimize`
- `POST /ai/resume/generate`
- `POST /ai/assistant/chat`

## Deployment (Fly.io, Docker)

Deployed as a Docker container from the monorepo via `fly.toml`:

- App: `skillsaarthi-ai` (region `bom`), Dockerfile `Dockerfile`
- Internal port: `7860` (Fly injects `PORT`; the container listens on `${PORT:-7860}`)
- Secrets (never committed): `fly secrets set AI_BASE_URL=... AI_MODEL=... AI_KEY=...`
- `min_machines_running = 1` keeps one machine always on — no cold-start race
  with the backend's AI timeouts.

The container listens on `${PORT:-7860}`, so any platform that injects `PORT`
(Render, Cloud Run, Fly.io) works without changes.

## LLM provider

Any OpenAI-compatible gateway works — `app/ai/client.py` reads
`AI_BASE_URL` / `AI_MODEL` / `AI_KEY` from the environment. Primary is the TCET
Qwen gateway (`https://ai.tcetcercd.in/v1`, `Qwen3.6-35B-A3B`); switch providers
by editing env vars only.

## Tests

```bash
pip install -r requirements.txt
python -m pytest
```
