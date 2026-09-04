"""OpenAI-compatible client for the TCET CoE AI Gateway.

Architecture::

    Frontend
        ↓
    Node backend
        ↓
    this Python service  (ai-service)
        ↓
    TCET CoE AI Gateway   (https://ai.tcetcercd.in/v1)
        ↓
    Qwen3.6-35B-A3B

The gateway API key is read from server-side environment variables only
(``AI_KEY``, with ``LLM_API_KEY`` as a legacy fallback). It is never exposed
to the frontend or the Node backend.
"""

import json
import logging
import os
import re

from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    OpenAI,
)

logger = logging.getLogger(__name__)

AI_BASE_URL = os.getenv("AI_BASE_URL", "https://ai.tcetcercd.in/v1")
AI_MODEL = os.getenv("AI_MODEL", "Qwen3.6-35B-A3B")
AI_KEY = os.getenv("AI_KEY") or os.getenv("LLM_API_KEY", "")
AI_TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT_SECONDS", "120"))
AI_MAX_RETRIES = int(os.getenv("AI_MAX_RETRIES", "2"))

# Prompt versions: bump any of these whenever its prompt/schema changes so
# results stay interpretable across deployments.
EXTRACTION_PROMPT_VERSION = "v1"
ANALYSIS_PROMPT_VERSION = "v2"
MATCH_PROMPT_VERSION = "v1"
OPTIMIZATION_PROMPT_VERSION = "v1"


class AIGatewayError(Exception):
    """Base error for gateway failures surfaced to the caller."""

    code = "AI_GATEWAY_ERROR"


class AIConfigurationError(AIGatewayError):
    code = "AI_NOT_CONFIGURED"


class AIUnavailableError(AIGatewayError):
    """Transient gateway failure (busy, timeout, 502, ...)."""

    code = "AI_UNAVAILABLE"


class AIResponseError(AIGatewayError):
    """Permanent gateway failure (invalid key, malformed request, ...)."""

    def __init__(self, message, code="AI_GATEWAY_ERROR", status=None):
        super().__init__(message)
        self.code = code
        self.status = status


class AIJSONError(AIGatewayError):
    code = "AI_INVALID_JSON"


def _client():
    if not AI_KEY:
        raise AIConfigurationError(
            "The AI gateway is not configured. Set AI_KEY (or LLM_API_KEY) "
            "in ai-service/.env."
        )
    return OpenAI(
        base_url=AI_BASE_URL,
        api_key=AI_KEY,
        timeout=AI_TIMEOUT_SECONDS,
        max_retries=0,
    )


def _raise_for_status(error):
    """Translate SDK exceptions into our controlled error taxonomy.

    Gateway docs: 401 invalid key, 400 malformed request, 502 model server
    unavailable, timeouts when the model is busy.
    """
    if isinstance(error, AuthenticationError):
        raise AIResponseError(
            "The AI gateway rejected the API key. Check AI_KEY.",
            code="AI_INVALID_KEY",
            status=401,
        )
    if isinstance(error, APIStatusError):
        if error.status_code == 400:
            raise AIResponseError(
                "The AI gateway rejected the request as malformed.",
                code="AI_BAD_REQUEST",
                status=400,
            )
        if error.status_code == 429:
            raise AIUnavailableError(
                "The AI gateway is rate-limiting requests. Try again shortly."
            )
        if error.status_code == 502:
            raise AIUnavailableError(
                "The AI gateway model server is temporarily unavailable."
            )
        if error.status_code == 503:
            raise AIUnavailableError(
                "The AI gateway is temporarily unavailable."
            )
    if isinstance(error, APITimeoutError):
        raise AIUnavailableError(
            "The AI gateway timed out — the model may be busy. Try again."
        )
    if isinstance(error, APIConnectionError):
        raise AIUnavailableError(
            "Could not reach the AI gateway. Check AI_BASE_URL and network access."
        )
    raise AIResponseError(str(error))


def _retry(times, func):
    """Run func() with bounded exponential backoff on transient failures."""
    last_error = None
    for attempt in range(max(1, times + 1)):
        try:
            return func()
        except AIUnavailableError as exc:
            last_error = exc
            if attempt >= times:
                break
            import time

            time.sleep(min(2 ** attempt, 8))
    raise last_error


def chat(
    messages,
    *,
    temperature=0.2,
    max_tokens=2000,
    enable_thinking=False,
    reasoning_effort="low",
    retries=None,
):
    """Send a chat request to the gateway and return the message content.

    ``enable_thinking`` / ``reasoning_effort`` map to the gateway's
    ``chat_template_kwargs`` reasoning controls. Simple extractions keep
    thinking disabled; complex semantic analysis may enable it.
    """
    retries = AI_MAX_RETRIES if retries is None else retries
    # Groq / generic OpenAI gateways don't support chat_template_kwargs (TCET-only)
    is_groq = "groq.com" in AI_BASE_URL
    kwargs = {
        "model": AI_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if not is_groq:
        kwargs["extra_body"] = {
            "chat_template_kwargs": {
                "enable_thinking": enable_thinking,
                "reasoning_effort": reasoning_effort,
            }
        }

    def call():
        try:
            response = _client().chat.completions.create(**kwargs)
        except Exception as error:  # noqa: BLE001 — normalize SDK errors
            _raise_for_status(error)
        return response.choices[0].message.content or ""

    return _retry(retries, call)


_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL | re.IGNORECASE)


def _json_span_candidates(text):
    """Yield progressively looser candidate strings that may hold JSON."""
    yield text
    fenced = _JSON_FENCE_RE.search(text)
    if fenced:
        yield fenced.group(1)
    # Longest balanced-brace substring.
    start = text.find("{")
    if start != -1:
        depth = 0
        end = None
        for index in range(start, len(text)):
            char = text[index]
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    end = index + 1
                    break
        if end is not None:
            yield text[start:end]


def extract_json(text):
    """Parse a JSON object out of a model response."""
    if not text or not text.strip():
        raise AIJSONError("The model returned an empty response.")
    seen = set()
    for candidate in _json_span_candidates(text):
        candidate = candidate.strip()
        if not candidate or candidate in seen:
            continue
        seen.add(candidate)
        try:
            data = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict):
            return data
        raise AIJSONError("The model did not return a JSON object.")
    raise AIJSONError("The model response did not contain valid JSON.")


def complete_json(
    messages,
    *,
    validator=None,
    temperature=0.2,
    max_tokens=4000,
    enable_thinking=False,
    reasoning_effort="low",
    retries=None,
):
    """Request structured JSON, validating and repairing it on failure.

    Bounded recovery loop:

    1. call the model
    2. parse JSON
    3. run ``validator`` (normalize + validate) if provided
    4. on any parse/validation failure, tell the model what went wrong and
       retry with the corrected conversation

    Permanent gateway errors propagate unchanged. If JSON is still invalid
    after the bounded retries an :class:`AIJSONError` is raised — malformed
    AI output is never silently accepted.
    """
    retries = AI_MAX_RETRIES if retries is None else retries
    max_attempts = retries + 2  # initial try + bounded repairs
    last_error = None

    for attempt in range(max_attempts):
        content = chat(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
            enable_thinking=enable_thinking,
            reasoning_effort=reasoning_effort,
            retries=retries,
        )
        try:
            data = extract_json(content)
        except AIJSONError as exc:
            last_error = exc
            if attempt >= max_attempts - 1:
                break
            messages = _correction_turn(messages, content, str(exc))
            continue
        if validator is not None:
            try:
                return validator(data)
            except AIGatewayError as exc:
                last_error = exc
                if attempt >= max_attempts - 1:
                    break
                messages = _correction_turn(messages, content, str(exc))
                continue
        return data

    raise last_error if last_error is not None else AIJSONError(
        "Could not obtain valid JSON from the model."
    )


def _correction_turn(messages, assistant_content, problem):
    return messages + [
        {"role": "assistant", "content": assistant_content},
        {
            "role": "user",
            "content": (
                "Your previous response was not acceptable: "
                f"{problem}. Return ONLY a single valid JSON object that "
                "matches the requested schema exactly, with no commentary."
            ),
        },
    ]
