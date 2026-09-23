"""Assistant prompt builder — career advisor with user profile context."""

import json


ASSISTANT_SYSTEM = """You are skillsaarthi AI Career Assistant — a warm, concise, helpful one-stop career & education advisor.

Rules:
- Use the USER PROFILE (education, skills with proficiency 1-5, interests, goals, assessment score, experience years) as ground truth. Recommend careers that fit their current profile.
- Explain WHY a career fits (reason strengths, skill gaps).
- For roadmap: ordered steps Learn/Build/Certify, not generic advice.
- For skill gaps: list missing skills with importance.
- Never invent user data. If profile is empty, ask for onboarding.
- Keep answers concise, actionable, bullet-friendly. Use markdown headings/bullets where helpful.
- Disclaimer: recommendations are guidance, not guarantees.
"""


def _as_message(item):
    """Coerce a history entry into ``(role, content)``; tolerate malformed items."""
    if isinstance(item, dict):
        role = item.get("role") if item.get("role") in ("user", "assistant") else "user"
        content = item.get("content", "")
    else:
        role, content = "user", item
    return role, str(content or "")


MAX_HISTORY_TURNS = 8
MAX_HISTORY_CHARS_PER_TURN = 1500


def _compact_profile(profile):
    """Compact one-line JSON — same data, ~15-20% fewer prompt tokens vs indent=2."""
    try:
        return json.dumps(profile or {}, ensure_ascii=False, separators=(",", ":"))
    except Exception:
        return "{}"


def build_assistant_messages(profile, history, user_message):
    profile_block = f"USER PROFILE (JSON):\n{_compact_profile(profile)}\n"
    trimmed = []
    if history:
        # last 8 turns to keep context small; truncate long turns to bound latency
        raw = [_as_message(h) for h in history[-MAX_HISTORY_TURNS:]]
        trimmed = [(role, content[:MAX_HISTORY_CHARS_PER_TURN]) for role, content in raw]

    system = ASSISTANT_SYSTEM + "\n" + profile_block
    messages = [{"role": "system", "content": system}]
    # replay history
    for role, content in trimmed:
        messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_message})
    return messages
