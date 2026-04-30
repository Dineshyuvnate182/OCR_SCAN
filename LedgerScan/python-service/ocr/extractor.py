from ocr.image_ocr import extract_from_image
from ocr.pdf_ocr import extract_from_pdf
from utils.response_formatter import format_success, format_error

IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp"]
PDF_TYPE = "application/pdf"

def extract_text(file_path: str, content_type: str) -> dict:
    """
    Dispatcher: routes file to the correct OCR handler based on content type.
    Returns a standardised response dict.
    """
    try:
        if content_type in IMAGE_TYPES:
            text = extract_from_image(file_path)
        elif content_type == PDF_TYPE:
            text = extract_from_pdf(file_path)
        else:
            return format_error(f"Unsupported content type: {content_type}")

        if not text or not text.strip():
            return format_error("No readable text found in the file")

        return format_success(text)

    except Exception as e:
        return format_error(str(e))
