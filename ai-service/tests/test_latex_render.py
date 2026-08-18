"""LaTeX renderer tests: deterministic output, no empty sections, escaping."""

from app.resume.latex.renderer import render_resume
from tests.fixtures import minimal_resume, sample_resume


def test_renders_document_shell():
    tex = render_resume(sample_resume())
    assert "\\documentclass" in tex
    assert "\\begin{document}" in tex
    assert "\\end{document}" in tex


def test_renders_name_and_contact():
    tex = render_resume(sample_resume())
    assert "Jane Doe" in tex
    assert "jane.doe@example.com" in tex


def test_sections_rendered_only_when_data_exists():
    full = render_resume(sample_resume())
    assert "\\section{Experience}" in full
    assert "\\section{Technical Skills}" in full

    minimal = render_resume(minimal_resume())
    assert "\\section{Experience}" not in minimal
    assert "\\section{Technical Skills}" not in minimal
    assert "\\section{Summary}" not in minimal


def test_user_content_is_escaped():
    resume = sample_resume()
    resume["projects"][0]["bullets"] = [
        "Built x & y with 100% uptime, cost $5, uses #hashtag _ok_ {brace}"
    ]
    tex = render_resume(resume)
    assert "\\&" in tex
    assert "\\%" in tex
    assert "\\$" in tex
    assert "\\#" in tex
    assert "\\_" in tex
    assert "\\{" in tex
    assert "\\}" in tex


def test_no_injection_via_bullet():
    resume = sample_resume()
    resume["projects"][0]["bullets"] = ["\\input{/etc/passwd}"]
    tex = render_resume(resume)
    assert "\\textbackslash{}input" in tex
    assert "\\input{/etc/passwd}" not in tex


def test_deterministic_output():
    assert render_resume(sample_resume()) == render_resume(sample_resume())


def test_empty_resume_renders_shell():
    tex = render_resume({})
    assert "\\begin{document}" in tex


def test_skill_categories_rendered():
    tex = render_resume(sample_resume())
    assert "Languages:" in tex
    assert "Frameworks:" in tex
    assert "Databases:" in tex