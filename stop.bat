@echo off
setlocal enabledelayedexpansion

title OutReach System - Stop Services
echo ===============================================================================
echo        DHANKRANTI SHARE MARKET CLASSES - STOPPING SERVICES
echo ===============================================================================
echo.

echo [*] Stopping processes on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo     Terminated process PID %%a on port 8000
)

echo [*] Stopping processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo     Terminated process PID %%a on port 5173
)

echo.
echo [*] All OutReach services have been stopped.
echo ===============================================================================
timeout /t 3
