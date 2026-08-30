@echo off
echo Starting MedReach AI FastAPI Backend on http://127.0.0.1:8000 ...
cd backend
call .venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
