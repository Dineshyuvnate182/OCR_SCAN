from paddleocr import PaddleOCR
try:
    ocr = PaddleOCR(
        lang="en",
        use_textline_orientation=True,
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_mkldnn=False
    )
    result = ocr.ocr("test_img.png", cls=True)
    print("Success with use_mkldnn=False")
except Exception as e:
    print(f"Error: {e}")
