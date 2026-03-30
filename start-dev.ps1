$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$envPath = Join-Path $backendPath ".env"
$envExamplePath = Join-Path $backendPath ".env.example"

if (-not (Test-Path $envPath)) {
  Copy-Item $envExamplePath $envPath -Force
}

$envLine = Get-Content $envPath | Where-Object { $_ -match '^GROQ_API_KEY=' } | Select-Object -First 1
$key = ""
if ($envLine) {
  $key = ($envLine -split "=", 2)[1].Trim()
}

if ([string]::IsNullOrWhiteSpace($key) -or $key -eq "your_actual_key" -or $key -eq "your_key_here" -or $key -eq "YOUR_GROQ_API_KEY") {
  Write-Host "Please set GROQ_API_KEY in backend/.env first, then run this script again." -ForegroundColor Yellow
  Write-Host "File: $envPath" -ForegroundColor Cyan
  exit 1
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location $backendPath
c:/python313/python.exe -m pip install -r requirements.txt

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location $frontendPath
npm install

Write-Host "Starting backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; c:/python313/python.exe -m uvicorn main:app --reload --port 8000"

Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

Write-Host "Done. Paste API key in backend/.env and run .\start-dev.ps1 whenever needed." -ForegroundColor Green
