#Requires -Version 5.1
# skillsaarthi one-command dev launcher (Windows PowerShell).
#
# Opens one terminal window per service:
#   1. Frontend (Vite)      -> http://localhost:5173   (repo root / npm run dev)
#   2. Backend (Express)    -> http://localhost:5000   (server/    / npm run dev)
#   3. AI Service (FastAPI) -> http://localhost:8000   (ai-service/ uvicorn app.main:app)
#
# It checks for missing dependencies first (frontend/backend node_modules and the
# ai-service virtualenv) and installs them before launching the windows.
#
# Usage:
#   .\dev.ps1
#
# If PowerShell blocks the script, allow it for the current session once:
#   Set-ExecutionPolicy -Scope Process RemoteSigned

$ErrorActionPreference = 'Stop'
$Root      = $PSScriptRoot
$ServerDir = Join-Path $Root 'server'
$AiDir     = Join-Path $Root 'ai-service'
$VenvPython = Join-Path $AiDir 'venv\Scripts\python.exe'

function Invoke-In([string]$Dir, [scriptblock]$Action) {
    Push-Location $Dir
    try { & $Action } finally { Pop-Location }
}

Write-Host ''
Write-Host '===== skillsaarthi dev launcher =====' -ForegroundColor Cyan

# --- Frontend dependencies (repo root) ---
if (-not (Test-Path (Join-Path $Root 'node_modules'))) {
    Write-Host 'Installing frontend dependencies (npm install) ...' -ForegroundColor Yellow
    Invoke-In $Root { npm install }
}

# --- Backend dependencies (server/) ---
if (-not (Test-Path (Join-Path $ServerDir 'node_modules'))) {
    Write-Host 'Installing backend dependencies (npm install) ...' -ForegroundColor Yellow
    Invoke-In $ServerDir { npm install }
}

# --- AI service virtualenv + requirements ---
if (-not (Test-Path $VenvPython)) {
    Write-Host 'Creating AI service virtualenv ...' -ForegroundColor Yellow
    Invoke-In $AiDir { python -m venv venv }
}
if (-not (Test-Path $VenvPython)) {
    Invoke-In $AiDir { python3 -m venv venv }
}
if (Test-Path $VenvPython) {
    Write-Host 'Installing AI service requirements ...' -ForegroundColor Yellow
    Invoke-In $AiDir { & '.\venv\Scripts\python.exe' -m pip install -r requirements.txt -q }
}

# --- Open one terminal window per service ---
$frontendCmd = "Set-Location '$Root'; npm run dev"
$backendCmd  = "Set-Location '$ServerDir'; npm run dev"
$aiCmd       = "Set-Location '$AiDir'; & '.\venv\Scripts\python.exe' -m uvicorn app.main:app --reload"

Start-Process powershell.exe -ArgumentList @('-NoExit', '-Command', $frontendCmd) -WorkingDirectory $Root
Start-Process powershell.exe -ArgumentList @('-NoExit', '-Command', $backendCmd) -WorkingDirectory $Root
Start-Process powershell.exe -ArgumentList @('-NoExit', '-Command', $aiCmd) -WorkingDirectory $Root

Write-Host ''
Write-Host 'Launched 3 windows. Keep them all open:' -ForegroundColor Green
Write-Host '  1. Frontend   -> http://localhost:5173'
Write-Host '  2. Backend    -> http://localhost:5000'
Write-Host '  3. AI Service -> http://localhost:8000'
Write-Host 'Closing a window stops that service.'