"""LaTeX escaping safety tests."""

from app.resume.latex.escape import escape_latex, sanitize_url


def test_escape_special_characters():
    out = escape_latex("A & B % C $ D # E _ F { G } H ~ I ^ J")
    assert "\\&" in out
    assert "\\%" in out
    assert "\\$" in out
    assert "\\#" in out
    assert "\\_" in out
    assert "\\{" in out
    assert "\\}" in out
    assert "\\textasciitilde{}" in out
    assert "\\textasciicircum{}" in out


def test_escape_backslash_first():
    out = escape_latex("\\input{evil}")
    assert "\\textbackslash{}" in out
    # The injected command must not survive escaping.
    assert "\\input{evil}" not in out
    assert "\\{" in out and "\\}" in out


def test_escape_drops_control_characters():
    out = escape_latex("line1\nline2\x00\x1f")
    assert "\x00" not in out
    assert "\x1f" not in out


def test_escape_none_and_empty():
    assert escape_latex(None) == ""
    assert escape_latex("") == ""


def test_escape_plain_text_unchanged():
    assert escape_latex("Hello world") == "Hello world"


def test_sanitize_url_keeps_http():
    assert sanitize_url("https://example.com/a?x=1&y=2") == "https://example.com/a?x=1&y=2"


def test_sanitize_url_prefixes_missing_scheme():
    assert sanitize_url("github.com/jane") == "https://github.com/jane"


def test_sanitize_url_rejects_dangerous_schemes():
    assert sanitize_url("javascript:alert(1)") == ""
    assert sanitize_url("file:///etc/passwd") == ""


def test_sanitize_url_rejects_backslashes():
    assert "\\" not in sanitize_url("https://example.com/\\newpage")
    assert sanitize_url("https://example.com/\\newpage") == "https://example.com/newpage"


def test_sanitize_url_empty():
    assert sanitize_url("") == ""
    assert sanitize_url(None) == ""