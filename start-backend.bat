@echo off
echo ===================================================
echo   Grace Victory Church (GVC) - Backend Server
echo ===================================================
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)
echo Starting FastAPI server at http://localhost:8000 ...
python run.py
pause
