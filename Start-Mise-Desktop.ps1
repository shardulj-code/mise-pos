$PSScriptRootDirectory = $PSScriptRoot
Set-Location $PSScriptRootDirectory

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Mise Restaurant Operating System (Desktop) " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

if (-not (Test-Path "$PSScriptRootDirectory\dist")) {
  Write-Host "[1/3] Building production bundle..." -ForegroundColor Green
  npm run build
}

$PORT = 4173
$URL = "http://localhost:$PORT"

Write-Host "[2/3] Starting Mise local server on $URL..." -ForegroundColor Green
Start-Process -FilePath "npx" -ArgumentList "vite preview --port $PORT --host 0.0.0.0" -WindowStyle Hidden

Start-Sleep -Seconds 2

Write-Host "[3/3] Launching Mise POS Desktop Interface..." -ForegroundColor Green
try {
  Start-Process "msedge" -ArgumentList "--app=$URL" -ErrorAction Stop
} catch {
  try {
    Start-Process "chrome" -ArgumentList "--app=$URL" -ErrorAction Stop
  } catch {
    Start-Process $URL
  }
}

Write-Host ""
Write-Host "Mise POS is live at: $URL" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
