@echo off
title Grace Victory Church - Server Launcher
echo ======================================================================
echo           GRACE VICTORY CHURCH (GVC) - FULL STACK LAUNCHER
echo ======================================================================
echo.

echo [1/2] Starting Backend API Server (FastAPI on http://localhost:8000)...
start "GVC Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe run.py"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Web Server (React Vite on http://localhost:3000)...
start "GVC Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo  Both Frontend & Backend are now running in separate windows!
echo.
echo  - Frontend Website : http://localhost:3000
echo  - Backend API Docs : http://localhost:8000/docs
echo  - Admin Shortcut   : Press Ctrl + Shift + A (Password: admin123)
echo ======================================================================
echo.
pause
