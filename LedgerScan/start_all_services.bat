@echo off
echo [1/3] Starting Backend...
start cmd /k "cd backend && npm install && npm run dev"

echo [2/3] Starting Frontend...
start cmd /k "cd frontend && npm install && npm run dev"

echo [3/3] Starting Python OCR Service...
start cmd /k "cd python-service && pip install -r requirements.txt && python main.py"

echo All services attempt to start in separate windows.
echo Please wait for the Python service to finish 'Loading PaddleOCR reader (CPU)...' before uploading.
pause
