"""Server-side LaTeX → PDF compilation.

The compiler is detected at runtime — we never assume ``pdflatex`` exists.
Compilation runs in an isolated temporary directory with a timeout and no
shell, so user-supplied resume content cannot influence the command line or
escape the sandbox. On failure the generated ``.tex`` is preserved and a
useful error is returned instead of silently producing a broken PDF.
"""

import logging
import os
import shutil
import subprocess
import tempfile

logger = logging.getLogger(__name__)

COMPILERS = ("pdflatex", "xelatex", "latexmk")
# Generous default: MiKTeX's very first compile may need to download and
# install packages, which can take over a minute on a cold install.
COMPILE_TIMEOUT_SECONDS = int(os.getenv("LATEX_COMPILE_TIMEOUT", "300"))


def _candidate_compiler_paths():
    """Yield (name, executable) from PATH, then from common install roots.

    ``expanduser`` keeps the MiKTeX probe correct regardless of the Windows
    account name (the previous hardcoded ``Administrator`` path missed
    machines where MiKTeX installs under a different user profile).
    """
    home_dir = os.path.expanduser("~")
    # Should match the install layout of winget/chocolatey MiKTeX.
    _COMMON_INSTALL_DIRS = (
        r"C:\Program Files\MiKTeX\miktex\bin\x64",
        os.path.join(home_dir, r"AppData\Local\Programs\MiKTeX\miktex\bin\x64"),
        r"C:\texlive\bin",
    )
    for compiler in COMPILERS:
        path = shutil.which(compiler)
        if path:
            yield compiler, path
    # Fall back to scanning common install roots once.
    for root in _COMMON_INSTALL_DIRS:
        if not os.path.isdir(root):
            continue
        for entry in os.listdir(root):
            full = os.path.join(root, entry)
            if os.path.isfile(full) and entry in ("pdflatex.exe", "xelatex.exe", "latexmk.exe"):
                yield entry.rsplit(".", 1)[0], full


def find_compiler():
    """Return ``(name, executable)`` for an available LaTeX compiler."""
    for name, path in _candidate_compiler_paths():
        try:
            subprocess.run(
                [path, "--version"],
                capture_output=True,
                timeout=15,
                check=False,
                shell=False,
            )
            return name, path
        except (OSError, subprocess.SubprocessError):
            continue
    return None, None


def compile_pdf(tex_source, compiler_name=None, timeout=COMPILE_TIMEOUT_SECONDS):
    """Compile LaTeX source into a PDF inside a sandboxed temp directory.

    Returns a result dict::

        {"ok": True, "pdf_bytes": bytes, "compiler": name, "log": str}
        {"ok": False, "error": str, "compiler": name|None, "log": str}
    """
    compiler_path = None
    if not compiler_name:
        compiler_name, compiler_path = find_compiler()
    if not compiler_name:
        return {
            "ok": False,
            "error": (
                "No LaTeX compiler (pdflatex/xelatex) is available on this "
                "server, so the PDF could not be generated. The LaTeX source "
                "is still available for download."
            ),
            "compiler": None,
            "log": "",
        }

    workdir = tempfile.mkdtemp(prefix="resume-latex-")
    tex_path = os.path.join(workdir, "resume.tex")
    try:
        with open(tex_path, "w", encoding="utf-8") as handle:
            handle.write(tex_source)

        args = [compiler_path or compiler_name, "-interaction=nonstopmode", "-halt-on-error", "-jobname=resume", "resume.tex"]
        # MiKTeX installs packages on-demand only when told to; TeX Live has
        # no such flag, so gate it on the detected distribution.
        if "miktex" in (compiler_path or "").lower():
            args.insert(1, "--enable-installer")
        completed = subprocess.run(
            args,
            cwd=workdir,
            capture_output=True,
            timeout=timeout,
            check=False,
            shell=False,
        )
        log = (completed.stdout or b"") + (completed.stderr or b"")
        log = log.decode("utf-8", errors="replace")[:8000]

        pdf_path = os.path.join(workdir, "resume.pdf")
        if completed.returncode != 0 or not os.path.isfile(pdf_path):
            return {
                "ok": False,
                "error": "LaTeX compilation failed. The .tex source is preserved for debugging.",
                "compiler": compiler_name,
                "log": log,
            }

        # LaTeX asks to be rerun when cross-references/outlines changed on the
        # first pass (hyperref bookmarks, etc.). One extra pass produces final
        # outlines; it is cheap once packages are installed.
        if "rerun" in log.lower() or "latex rerun" in log.lower():
            rerun = subprocess.run(
                args,
                cwd=workdir,
                capture_output=True,
                timeout=timeout,
                check=False,
                shell=False,
            )
            rerun_log = (rerun.stdout or b"") + (rerun.stderr or b"")
            if rerun.returncode == 0:
                log = rerun_log.decode("utf-8", errors="replace")[:8000]

        with open(pdf_path, "rb") as handle:
            pdf_bytes = handle.read()
        return {
            "ok": True,
            "pdf_bytes": pdf_bytes,
            "compiler": compiler_name,
            "log": log,
        }
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "error": "LaTeX compilation timed out.",
            "compiler": compiler_name,
            "log": "",
        }
    except OSError as error:
        return {
            "ok": False,
            "error": "Could not run the LaTeX compiler: %s" % error,
            "compiler": compiler_name,
            "log": "",
        }
    finally:
        shutil.rmtree(workdir, ignore_errors=True)
