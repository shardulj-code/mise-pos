$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Mise Restaurant Operating System (Desktop) " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

$PORT = 4173
$URL = "http://localhost:$PORT"

if (Test-Path "$ScriptDir\web-app\index.html") {
  Write-Host "[1/2] Serving precompiled web app on $URL..." -ForegroundColor Green
  Set-Location "$ScriptDir\web-app"
  Start-Process -FilePath "npx" -ArgumentList "--yes serve -l $PORT" -WindowStyle Hidden -ErrorAction SilentlyContinue
} else {
  $ParentDir = Split-Path -Parent $ScriptDir
  Set-Location $ParentDir
  if (-not (Test-Path "$ParentDir\dist")) {
    Write-Host "[1/3] Building production bundle..." -ForegroundColor Green
    npm run build
  }
  Write-Host "[2/3] Starting Mise local preview on $URL..." -ForegroundColor Green
  Start-Process -FilePath "npx" -ArgumentList "vite preview --port $PORT --host 0.0.0.0" -WindowStyle Hidden -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

Write-Host "[2/2] Launching Mise POS Desktop Interface..." -ForegroundColor Green

if (Get-Command msedge -ErrorAction SilentlyContinue) {
  Start-Process msedge -ArgumentList "--app=$URL"
} elseif (Get-Command chrome -ErrorAction SilentlyContinue) {
  Start-Process chrome -ArgumentList "--app=$URL"
} else {
  Start-Process $URL
}

Write-Host ""
Write-Host "Mise POS is running at: $URL" -ForegroundColor Cyan
Write-Host "Network devices (Kitchen, Waiter, Counter) can connect using your local IP:" -ForegroundColor DarkYellow
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notmatch "^169\." } | ForEach-Object {
  Write-Host "  -> http://$($_.IPAddress):$PORT" -ForegroundColor Yellow
}
Write-Host "=============================================" -ForegroundColor Cyan
