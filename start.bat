@echo off
setlocal enabledelayedexpansion

title OutReach System - Dhankranti Review Portal Launcher
cd /d "%~dp0"

echo ===============================================================================
echo        DHANKRANTI SHARE MARKET CLASSES - OUTREACH REVIEW SYSTEM
echo ===============================================================================
echo.

:: 1. Check Python installation
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://www.python.org/ and check "Add to PATH".
    echo.
    pause
    exit /b 1
)

:: 2. Check Node.js and npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in PATH!
    echo Please install Node.js (LTS) from https://nodejs.org/.
    echo.
    pause
    exit /b 1
)

:: 3. Setup Backend Virtual Environment if missing
if not exist "backend\venv\Scripts\python.exe" (
    echo [*] Python virtual environment not found. Creating backend\venv...
    python -m venv backend\venv
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [*] Installing backend dependencies from requirements.txt...
    call "backend\venv\Scripts\pip.exe" install -r backend\requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

:: 4. Ensure backend/data directory exists and seed database if missing
if not exist "backend\data" (
    mkdir "backend\data"
)

if not exist "backend\data\review_app.db" (
    echo [*] Database not found. Seeding initial data (Admin, Shop, Categories, Reviews)...
    call "backend\venv\Scripts\python.exe" backend\seed.py
)

:: 5. Setup Frontend dependencies if missing
if not exist "frontend\node_modules" (
    echo [*] Frontend dependencies not found. Running npm install...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install frontend packages.
        pause
        exit /b 1
    )
)

echo.
echo ===============================================================================
echo  Starting Services:
echo   - Backend:  FastAPI on http://127.0.0.1:8000
echo   - Frontend: Vite React on http://localhost:5173
echo ===============================================================================
echo.

:: 6. Launch Backend in a separate titled window
start "OutReach Backend [FastAPI - Port 8000]" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: 7. Launch Frontend in a separate titled window
start "OutReach Frontend [Vite React - Port 5173]" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: 8. Wait a few seconds for servers to start
echo [*] Waiting 4 seconds for servers to boot up...
timeout /t 4 /nobreak >nul

:: 9. Open the default web browser to the homepage
start http://localhost:5173

echo.
echo ===============================================================================
echo  OutReach System is now running!
echo.
echo  Access Points:
echo    - Main Portal:        http://localhost:5173/
echo    - Student QR Flow:    http://localhost:5173/r/dhankranti
echo    - Admin Login:        http://localhost:5173/admin/login
echo          Email:          admin@example.com
echo          Password:       Admin@123
echo    - Swagger API Docs:   http://127.0.0.1:8000/docs
echo.
echo  To shut down: Close the two opened command prompt windows.
echo ===============================================================================
echo.
pause
