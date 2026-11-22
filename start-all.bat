@echo off
echo ===================================================================
echo     Grace Victory Church (GVC) - Starting Fullstack Application
echo ===================================================================
echo.
echo [1/2] Launching Python FastAPI Backend on port 8000...
start "GVC Church Backend (FastAPI)" cmd /k "start-backend.bat"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React.js Frontend on port 3000...
start "GVC Church Frontend (React)" cmd /k "start-frontend.bat"

echo.
echo ===================================================================
echo   Website running at: http://localhost:3000
echo   API & Swagger Docs: http://localhost:8000/docs
echo   Staff Portal:       http://localhost:3000/admin
echo ===================================================================
