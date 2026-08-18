"""Tests for the AI gateway client: JSON parsing, repair loop, error mapping."""

from types import SimpleNamespace

import pytest

import app.ai.client as client
from app.ai.client import (
    AIJSONError,
    AIResponseError,
    AIUnavailableError,
    AIConfigurationError,
    complete_json,
    extract_json,
)
from openai import APIStatusError, AuthenticationError


def fake_response(status_code, text=None, content=None):
    return SimpleNamespace(
        status_code=status_code,
        text=text,
        content=content,
        request=None,
        headers={"x-request-id": "test"},
    )


def test_extract_json_plain():
    assert extract_json('{"a": 1}') == {"a": 1}


def test_extract_json_fenced():
    assert extract_json('```json\n{"a": 1}\n```') == {"a": 1}


def test_extract_json_with_surrounding_prose():
    assert extract_json('Here you go:\n{"a": 1}\nThat is all.') == {"a": 1}


def test_extract_json_empty():
    with pytest.raises(AIJSONError):
        extract_json("")


def test_extract_json_garbage():
    with pytest.raises(AIJSONError):
        extract_json("not json at all")


def test_complete_json_repairs_bad_json(monkeypatch):
    calls = []

    def fake_chat(messages, **kwargs):
        calls.append(messages)
        if len(calls) == 1:
            return "I will tell you about resumes..."
        return '{"ok": true}'

    monkeypatch.setattr(client, "chat", fake_chat)
    result = complete_json([{"role": "user", "content": "hi"}], retries=1)
    assert result == {"ok": True}
    assert len(calls) == 2
    # The repair turn must include the correction instruction.
    assert any("valid JSON" in c["content"] for c in calls[1])


def test_complete_json_repairs_via_validator(monkeypatch):
    calls = []

    def fake_chat(messages, **kwargs):
        calls.append(messages)
        return '{"name": "jane", "email": "j@example.com"}' if len(calls) > 1 else '{"name": "jane"}'

    def validator(data):
        if "email" not in data:
            raise AIJSONError("missing email")
        return data

    monkeypatch.setattr(client, "chat", fake_chat)
    result = complete_json([{"role": "user", "content": "hi"}], validator=validator, retries=1)
    assert result["email"] == "j@example.com"


def test_complete_json_raises_after_bounded_retries(monkeypatch):
    monkeypatch.setattr(client, "chat", lambda messages, **kwargs: "still not json")
    with pytest.raises(AIJSONError):
        complete_json([{"role": "user", "content": "hi"}], retries=1)


def test_retry_backs_off_then_succeeds(monkeypatch):
    import time

    sleeps = []
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))
    calls = []

    def flaky():
        calls.append(1)
        if len(calls) < 3:
            raise AIUnavailableError("busy")
        return "done"

    assert client._retry(2, flaky) == "done"
    assert len(calls) == 3
    assert sleeps == [1, 2]


def test_invalid_key_maps_to_permanent_error():
    error = AuthenticationError("bad", response=fake_response(401), body={})
    with pytest.raises(AIResponseError) as exc:
        client._raise_for_status(error)
    assert exc.value.code == "AI_INVALID_KEY"
    assert exc.value.status == 401


def test_unknown_status_maps_to_permanent_error():
    error = APIStatusError("nope", response=fake_response(500), body={})
    with pytest.raises(AIResponseError):
        client._raise_for_status(error)


def test_missing_key_raises_configuration_error(monkeypatch):
    monkeypatch.setattr(client, "AI_KEY", "")
    with pytest.raises(AIConfigurationError):
        client._client()