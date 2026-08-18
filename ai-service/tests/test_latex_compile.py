"""PDF compilation tests — graceful behavior, including no-compiler case."""

from app.resume.latex.compile import compile_pdf, find_compiler

SAMPLE_TEX = r"""\documentclass{article}
\begin{document}
Hello world.
\end{document}
"""


def test_find_compiler_returns_tuple():
    name, path = find_compiler()
    assert isinstance(name, (str, type(None)))
    assert isinstance(path, (str, type(None)))


def test_compile_without_compiler_is_graceful(monkeypatch):
    monkeypatch.setattr("app.resume.latex.compile.find_compiler", lambda: (None, None))
    result = compile_pdf(SAMPLE_TEX)
    assert result["ok"] is False
    assert "compiler" in result["error"].lower() or "latex" in result["error"].lower()
    assert result["compiler"] is None


def test_compile_with_invalid_compiler_reports_error(monkeypatch):
    monkeypatch.setattr(
        "app.resume.latex.compile.find_compiler",
        lambda: ("pdflatex", "C:/nonexistent/pdflatex.exe"),
    )
    result = compile_pdf(SAMPLE_TEX)
    assert result["ok"] is False
    assert result["error"]
