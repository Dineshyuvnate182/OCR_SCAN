import cv2
import numpy as np
from ocr.image_ocr import extract_from_image
import os

# create a dummy image
img = np.zeros((100, 100, 3), dtype=np.uint8)
cv2.imwrite("test_img.png", img)

try:
    print("Testing extraction")
    res = extract_from_image("test_img.png")
    print(f"Result: {res}")
except Exception as e:
    print(f"Error: {e}")
