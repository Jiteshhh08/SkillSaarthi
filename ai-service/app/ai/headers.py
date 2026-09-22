"""Shared HTTP headers for calls from the Node backend to this AI service.

The deployed AI service sits behind Cloudflare (SnapDeploy), which challenges
non-browser User-Agents with a 403 "Just a moment..." interstitial. Node's
default ``undici`` UA (``node``) and ``Python-urllib`` are both blocked, while
browser-like and monitoring UAs (cron-job.org) pass. Send a browser-like
User-Agent on every server-to-server call so production assistant/resume
requests are not rejected at the edge.

Keep this list aligned with ``server/src/utils/aiHeaders.js``.
"""

import os

from dotenv import load_dotenv

load_dotenv()

# Browser-like UA: matches what passes Cloudflare for plain HTTPS GET/POST
# without a JS challenge. Override with AI_SERVICE_USER_AGENT if the edge
# rules ever change.
DEFAULT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

AI_SERVICE_USER_AGENT = os.getenv("AI_SERVICE_USER_AGENT", DEFAULT_UA)

__all__ = ["AI_SERVICE_USER_AGENT", "DEFAULT_UA"]
