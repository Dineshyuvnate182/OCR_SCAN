def format_success(extracted_text: str) -> dict:
    return {
        "status": "success",
        "extracted_text": extracted_text.strip(),
        "char_count": len(extracted_text.strip()),
        "line_count": len(extracted_text.strip().splitlines()),
    }

def format_error(message: str) -> dict:
    return {
        "status": "error",
        "extracted_text": "",
        "error": message,
    }
