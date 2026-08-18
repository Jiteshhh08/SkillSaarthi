"""Resume ingestion — file bytes → raw resume text.

PDF text layers are extracted with pypdf (reusing the letter-spacing
densifier from :mod:`app.resume.analyzer`). DOCX files are converted with
python-docx. Image-only/scanned PDFs yield an empty text layer — the LLM
extraction then reports an empty resume rather than hallucinating one.
"""

import io
import logging
import re
import zipfile

logger = logging.getLogger(__name__)

MAX_RAW_TEXT = 20000

_PDF_MAGIC = b"%PDF"
_ZIP_MAGIC = b"PK\x03\x04"


def detect_kind(data, mime_type):
    if mime_type:
        mime = mime_type.lower()
        if "pdf" in mime:
            return "pdf"
        if mime in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"):
            return "docx" if "openxml" in mime else "doc"
    if data[:4] == _PDF_MAGIC:
        return "pdf"
    if data[:4] == _ZIP_MAGIC:
        return "docx"
    return "unknown"


def _extract_pdf(data):
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    pages = []
    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception:  # noqa: BLE001 — a single bad page must not kill extraction
            continue
    from .analyzer import densify_text

    return densify_text("\n".join(pages))


def _extract_docx(data):
    from docx import Document

    document = Document(io.BytesIO(data))
    parts = [paragraph.text for paragraph in document.paragraphs]
    for table in document.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells]
            parts.append(" | ".join(cells))
    return "\n".join(parts)


def extract_raw_text(data=None, text=None, mime_type=None):
    """Return up to MAX_RAW_TEXT chars of resume text.

    ``text`` (pre-extracted by the caller) takes precedence — this matches
    the existing analyzer contract.
    """
    if text and text.strip():
        return text[:MAX_RAW_TEXT]

    if not data:
        return ""

    if zipfile.is_zipfile(io.BytesIO(data)):
        try:
            return _extract_docx(data)[:MAX_RAW_TEXT]
        except Exception as error:  # noqa: BLE001
            logger.warning("DOCX parse failed: %s", error)
            return ""

    kind = detect_kind(data, mime_type)
    if kind == "pdf":
        try:
            return _extract_pdf(data)[:MAX_RAW_TEXT]
        except Exception as error:  # noqa: BLE001
            logger.warning("PDF parse failed: %s", error)
            return ""

    # Unknown or unsupported format.
    return ""