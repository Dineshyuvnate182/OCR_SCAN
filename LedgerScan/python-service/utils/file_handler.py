import os
import mimetypes

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".pdf"}

def get_mime_type(file_path: str) -> str:
    mime, _ = mimetypes.guess_type(file_path)
    return mime or "application/octet-stream"

def is_allowed_file(file_path: str) -> bool:
    ext = os.path.splitext(file_path)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def get_file_size_mb(file_path: str) -> float:
    return os.path.getsize(file_path) / (1024 * 1024)

def validate_file(file_path: str, max_size_mb: float = 20.0) -> tuple:
    """Returns (is_valid: bool, error_message: str)"""
    if not os.path.exists(file_path):
        return False, "File does not exist"
    if not is_allowed_file(file_path):
        return False, f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    size = get_file_size_mb(file_path)
    if size > max_size_mb:
        return False, f"File too large ({size:.1f} MB). Max: {max_size_mb} MB"
    return True, ""
