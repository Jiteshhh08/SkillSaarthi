"""Safe LaTeX escaping for user-provided resume content.

User text must never be inserted into LaTeX verbatim: characters such as
``& % $ # _ { } ~ ^`` and backslashes can break the document or inject
commands. Everything that ends up in the generated ``.tex`` goes through one
of these helpers first.
"""

import re

_ESCAPES = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}
_SPECIAL_RE = re.compile("[" + re.escape("".join(_ESCAPES)) + "]")
_ILLEGAL_CHARS_RE = re.compile(r"[\x00-\x1f\x7f-\x9f]")

_SCHEME_COLON_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")
_SAFE_SCHEMES = {"http", "https", "mailto", "tel"}
_MAX_URL_LENGTH = 2000


def escape_latex(value):
    """Escape arbitrary user text for safe insertion into LaTeX.

    Non-renderable control characters are dropped. Replacement is a single
    regex pass so the replacement text is never reprocessed.
    """
    if value is None:
        return ""
    text = str(value)
    text = _ILLEGAL_CHARS_RE.sub("", text)
    return _SPECIAL_RE.sub(lambda match: _ESCAPES[match.group()], text)


def sanitize_url(value):
    """Return a LaTeX-safe absolute URL, or an empty string if unusable.

    Backslashes, control characters, and non-http(s)/mailto/tel schemes are
    rejected so user input cannot inject LaTeX commands or odd protocols.
    """
    if value is None:
        return ""
    url = str(value).strip()
    url = _ILLEGAL_CHARS_RE.sub("", url)
    url = url.replace("\\", "")
    if not url:
        return ""
    scheme_match = _SCHEME_COLON_RE.match(url)
    if scheme_match:
        scheme = url[: scheme_match.end() - 1].lower()
        if scheme not in _SAFE_SCHEMES:
            return ""
        if scheme in ("http", "https") and "://" not in url:
            return ""
        return url[:_MAX_URL_LENGTH]
    url = "https://" + url
    return url[:_MAX_URL_LENGTH]


def escape_url_display(value):
    """Escape text shown next to a hyperlink (e.g. 'linkedin.com/in/x')."""
    if value is None:
        return ""
    return escape_latex(value)
