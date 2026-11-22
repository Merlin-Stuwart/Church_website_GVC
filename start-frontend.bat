@echo off
echo ===================================================
echo   Grace Victory Church (GVC) - React Frontend
echo ===================================================
cd frontend
if not exist node_modules (
    echo Installing node dependencies...
    npm install
)
echo Starting React Vite Dev Server at http://localhost:3000 ...
npm run dev
pause
