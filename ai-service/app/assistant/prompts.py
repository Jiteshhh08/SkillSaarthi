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


def build_assistant_messages(profile, history, user_message):
    profile_block = f"USER PROFILE (JSON):\n{json.dumps(profile or {}, ensure_ascii=False, indent=2)}\n"
    history_block = ""
    if history:
        # last 8 turns to keep context small
        trimmed = history[-8:]
        history_block = "CONVERSATION HISTORY:\n" + "\n".join(
            f"{h.get('role','user')}: {h.get('content','')}" for h in trimmed
        ) + "\n"

    system = ASSISTANT_SYSTEM + "\n" + profile_block
    messages = [{"role": "system", "content": system}]
    # replay history
    for h in trimmed if history else []:
        role = h.get("role") if h.get("role") in ("user", "assistant") else "user"
        messages.append({"role": role, "content": h.get("content","")})
    messages.append({"role": "user", "content": user_message})
    return messages
