@echo off
setlocal
cd /d "%~dp0"

echo =============================================
echo    Mise Restaurant Operating System (Desktop)
echo =============================================

if not exist "%CD%\dist" (
  echo [1/3] Building production bundle...
  call npm run build
)

set PORT=4173
set URL=http://localhost:%PORT%

echo [2/3] Starting Mise local server on %URL%...
start /b npx vite preview --port %PORT% --host 0.0.0.0 >nul 2>&1

timeout /t 2 /nobreak >nul

echo [3/3] Launching Mise POS Desktop Interface...
start "" msedge --app="%URL%" 2>nul || start "" chrome --app="%URL%" 2>nul || start "" "%URL%"

echo.
echo Mise POS is running at: %URL%
echo Ready for Waiter phones, Kitchen tablets, and Counter computers!
echo =============================================
