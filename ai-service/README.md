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

## Deployment (Render Docker, second account)

Deployed as a Docker web service from the monorepo (its own Render account,
so it gets a separate 750 instance-hours/month budget):

- Root Directory: `ai-service`, Dockerfile Path: `Dockerfile`
- Render injects `PORT`; the container listens on `${PORT:-7860}`
- Environment Variables (never committed): `AI_BASE_URL`, `AI_MODEL`, `AI_KEY`

The container listens on `${PORT:-7860}`, so any platform that injects `PORT`
(Render, Cloud Run) works without changes.

The Render free tier sleeps web services after 15 min idle (~60 s wake); keep it
warm with a cron-job.org job hitting `/health` every 5 minutes.

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
