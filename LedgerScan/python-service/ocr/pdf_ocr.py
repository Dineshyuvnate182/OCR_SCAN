import os
import tempfile
import fitz  # PyMuPDF — no Poppler needed on Windows
import pdfplumber
from ocr.image_ocr import extract_from_image


def is_text_pdf(pdf_path: str) -> bool:
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    return True
    except Exception:
        return False
    return False


def extract_text_pdf(pdf_path: str) -> str:
    texts = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    texts.append(page_text.strip())
    except Exception as exc:
        raise RuntimeError(f"Text-based PDF extraction failed: {exc}")

    return "\n\n".join(texts)


def convert_pdf_to_images(pdf_path: str, dpi: int = 300) -> list[str]:
    tmp_files = []
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=dpi)
        for img in images:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp_path = tmp.name
                tmp_files.append(tmp_path)
            img.save(tmp_path, format="PNG")
    except Exception:
        doc = fitz.open(pdf_path)
        try:
            for page in doc:
                mat = fitz.Matrix(dpi / 72, dpi / 72)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                    tmp_path = tmp.name
                    tmp_files.append(tmp_path)
                pix.save(tmp_path)
        finally:
            doc.close()
    return tmp_files


def extract_from_pdf(pdf_path: str) -> str:
    if is_text_pdf(pdf_path):
        text = extract_text_pdf(pdf_path)
        if text:
            return text

    page_images = convert_pdf_to_images(pdf_path)
    if not page_images:
        raise RuntimeError("Failed to convert scanned PDF to images")

    full_text_parts = []
    try:
        for page_num, image_path in enumerate(page_images, start=1):
            page_text = extract_from_image(image_path).strip()
            if page_text:
                full_text_parts.append(f"--- Page {page_num} ---\n{page_text}")
    finally:
        for f in page_images:
            if os.path.exists(f):
                os.remove(f)

    return "\n\n".join(full_text_parts)
