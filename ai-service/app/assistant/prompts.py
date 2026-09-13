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


def build_assistant_messages(profile, history, user_message):
    profile_block = f"USER PROFILE (JSON):\n{json.dumps(profile or {}, ensure_ascii=False, indent=2)}\n"
    history_block = ""
    trimmed = []
    if history:
        # last 8 turns to keep context small
        trimmed = [_as_message(h) for h in history[-8:]]
        history_block = "CONVERSATION HISTORY:\n" + "\n".join(
            f"{role}: {content}" for role, content in trimmed
        ) + "\n"

    system = ASSISTANT_SYSTEM + "\n" + profile_block
    messages = [{"role": "system", "content": system}]
    # replay history
    for role, content in trimmed:
        messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_message})
    return messages
