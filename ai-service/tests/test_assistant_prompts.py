"""Assistant prompt builder: profile context, history coercion, malformed input."""

from app.assistant.prompts import build_assistant_messages


def test_system_message_contains_profile():
    messages = build_assistant_messages({"education_level": "B.Tech"}, [], "hi")
    assert messages[0]["role"] == "system"
    assert "B.Tech" in messages[0]["content"]
    assert messages[-1] == {"role": "user", "content": "hi"}


def test_dict_history_preserves_roles_and_content():
    history = [
        {"role": "user", "content": "hello"},
        {"role": "assistant", "content": "hey"},
    ]
    messages = build_assistant_messages({}, history, "next")
    assert [m["role"] for m in messages] == ["system", "user", "assistant", "user"]
    assert messages[1]["content"] == "hello"
    assert messages[2]["content"] == "hey"


def test_string_history_is_coerced_not_crashing():
    messages = build_assistant_messages({}, ["string", 42], "next")
    assert [m["role"] for m in messages] == ["system", "user", "user", "user"]
    assert messages[1]["content"] == "string"
    assert messages[2]["content"] == "42"


def test_history_is_trimmed_to_last_eight_turns():
    history = [{"role": "user", "content": f"m{i}"} for i in range(20)]
    messages = build_assistant_messages({}, history, "next")
    assert len(messages) == 10
    assert messages[1]["content"] == "m12"


def test_unknown_role_defaults_to_user():
    messages = build_assistant_messages({}, [{"role": "system", "content": "x"}], "hi")
    assert messages[1]["role"] == "user"
