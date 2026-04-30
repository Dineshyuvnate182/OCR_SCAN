from paddleocr import PaddleOCR
import easyocr
import cv2
import numpy as np
import os
import tempfile

# Initialise once at module load (heavy model, only load once)
_ocr_engine = None
_easyocr_reader = None


def _get_engine():
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(
            lang="en",
            use_textline_orientation=True,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
        )
    return _ocr_engine


def _get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        _easyocr_reader = easyocr.Reader(["en"], gpu=False)
    return _easyocr_reader


def _resize_for_ocr(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    if max(h, w) < 1200:
        scale = 1200 / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
    return img


def _deskew_image(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    coords = np.column_stack(np.where(gray < 255))
    if coords.shape[0] < 30:
        return img

    angle = cv2.minAreaRect(coords)[-1]
    
    # OpenCV 4.5+ returns angle in [0, 90]
    if angle >= 45:
        angle = angle - 90

    if abs(angle) < 0.5:
        return img

    (h, w) = img.shape[:2]
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def _enhance_contrast(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    equalized = clahe.apply(gray)
    blurred = cv2.GaussianBlur(equalized, (3, 3), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh


def _preprocess_image(image_path: str) -> tuple[np.ndarray, np.ndarray]:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot read image at {image_path}")

    img = _resize_for_ocr(img)
    deskewed = _deskew_image(img)
    thresh = _enhance_contrast(deskewed)
    return deskewed, cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)


def _write_temp_image(img: np.ndarray) -> str:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, img)
        return tmp.name


def _parse_paddle_result(result) -> list[str]:
    lines = []
    if not result:
        return lines

    if isinstance(result[0], list) and len(result[0]) >= 2 and isinstance(result[0][1], tuple):
        result = [result]

    for page in result:
        for item in page:
            if not item or len(item) < 2:
                continue
            text_info = item[1]
            text = text_info[0] if isinstance(text_info, (list, tuple)) and len(text_info) >= 1 else str(text_info)
            if text and text.strip():
                lines.append(text.strip())
    return lines


def _parse_easyocr_result(result) -> list[str]:
    return [line[1].strip() for line in result if len(line) >= 3 and line[1].strip()]


def _clean_text(text: str) -> str:
    return "\n".join([line.strip() for line in text.splitlines() if line.strip()])


def _ocr_with_paddle(image_path: str) -> str:
    try:
        ocr = _get_engine()
        try:
            result = ocr.ocr(image_path, cls=True)
        except TypeError:
            result = ocr.ocr(image_path)
        lines = _parse_paddle_result(result)
        return _clean_text("\n".join(lines))
    except Exception as e:
        print(f"PaddleOCR error: {e}")
        return ""


def _ocr_with_easyocr(image_path: str, paragraph: bool = False) -> str:
    try:
        reader = _get_easyocr_reader()
        result = reader.readtext(image_path, detail=1, paragraph=paragraph)
        lines = _parse_easyocr_result(result)
        return _clean_text("\n".join(lines))
    except Exception as e:
        print(f"EasyOCR error: {e}")
        return ""


def extract_from_image(image_path: str) -> str:
    deskewed_img, preprocessed_img = _preprocess_image(image_path)
    preprocessed_path = _write_temp_image(preprocessed_img)
    deskewed_path = _write_temp_image(deskewed_img)

    try:
        candidates = [
            _ocr_with_paddle(preprocessed_path),
            _ocr_with_easyocr(preprocessed_path),
            _ocr_with_paddle(deskewed_path),
            _ocr_with_easyocr(deskewed_path, paragraph=True),
        ]

        best_text = max(candidates, key=lambda t: len(t or ""))
        return best_text
    finally:
        for tmp_path in (preprocessed_path, deskewed_path):
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
