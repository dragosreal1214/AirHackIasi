# Fogora demo - start API + Web in new windows and print the URLs.
#   .\start-demo.ps1
param(
  [int]$ApiPort = 8000,
  [int]$WebPort = 3000
)

$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$apiDir = Join-Path $root "apps\api"

Write-Host "Starting Fogora from $root" -ForegroundColor Cyan

# API (uvicorn, reachable on the LAN)
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$apiDir'; .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port $ApiPort"
)

# Web (Next.js dev)
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root'; pnpm --filter web dev"
)

# LAN IP for phone access
$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
  Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "  Local: http://localhost:$WebPort" -ForegroundColor Green
Write-Host "  API:   http://localhost:$ApiPort/health" -ForegroundColor Green
if ($ip) {
  Write-Host "  LAN:   http://${ip}:$WebPort  (set NEXT_PUBLIC_API_URL=http://${ip}:$ApiPort for phones)" -ForegroundColor Green
}
Write-Host ""
Write-Host "Wait ~10s for startup, then open the local URL." -ForegroundColor DarkGray
