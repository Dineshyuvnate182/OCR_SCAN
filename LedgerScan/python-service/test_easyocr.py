from ocr.image_ocr import _ocr_with_easyocr
try:
    res = _ocr_with_easyocr("test_img.png")
    print(f"EasyOCR success: '{res}'")
except Exception as e:
    print(f"Error: {e}")
