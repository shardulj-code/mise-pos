@echo off
setlocal
cd /d "%~dp0"

echo =============================================
echo    Mise Restaurant Operating System (Desktop)
echo =============================================

set PORT=4173
set URL=http://localhost:%PORT%

if exist "%~dp0web-app\index.html" (
  cd /d "%~dp0web-app"
  echo [1/2] Serving precompiled web app on %URL%...
  start /b npx --yes serve -l %PORT% >nul 2>&1 || start /b python -m http.server %PORT% >nul 2>&1
) else (
  cd /d "%~dp0\.."
  if not exist "%CD%\dist" (
    echo [1/3] Building production bundle...
    call npm run build
  )
  echo [2/3] Starting Mise local server on %URL%...
  start /b npx vite preview --port %PORT% --host 0.0.0.0 >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo [2/2] Launching Mise POS Desktop Interface...
start "" msedge --app="%URL%" 2>nul || start "" chrome --app="%URL%" 2>nul || start "" "%URL%"

echo.
echo Mise POS is running at: %URL%
echo Ready for Waiter phones, Kitchen tablets, and Counter computers!
echo =============================================
