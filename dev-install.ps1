#Requires -Version 5.1
# One-time dependency installer for skillsaarthi (Windows PowerShell).
# Installs frontend, backend, and AI-service dependencies if missing.
# Used by .vscode/tasks.json ("setup: install all dependencies") and safe to run directly.

$ErrorActionPreference = 'Stop'
$Root       = $PSScriptRoot
$ServerDir  = Join-Path $Root 'server'
$AiDir      = Join-Path $Root 'ai-service'
$VenvPython = Join-Path $AiDir 'venv\Scripts\python.exe'

function Invoke-In([string]$Dir, [scriptblock]$Action) {
    Push-Location $Dir
    try { & $Action } finally { Pop-Location }
}

Write-Host ''
Write-Host '===== skillsaarthi dependency installer =====' -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $Root 'node_modules'))) {
    Write-Host 'Installing frontend dependencies (npm install) ...' -ForegroundColor Yellow
    Invoke-In $Root { npm install }
} else {
    Write-Host 'Frontend dependencies already installed.' -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $ServerDir 'node_modules'))) {
    Write-Host 'Installing backend dependencies (npm install) ...' -ForegroundColor Yellow
    Invoke-In $ServerDir { npm install }
} else {
    Write-Host 'Backend dependencies already installed.' -ForegroundColor Green
}

if (-not (Test-Path $VenvPython)) {
    Write-Host 'Creating AI service virtualenv ...' -ForegroundColor Yellow
    Invoke-In $AiDir { python -m venv venv }
    if (-not (Test-Path $VenvPython)) {
        Invoke-In $AiDir { python3 -m venv venv }
    }
}

if (Test-Path $VenvPython) {
    Write-Host 'Installing AI service requirements ...' -ForegroundColor Yellow
    Invoke-In $AiDir { & '.\venv\Scripts\python.exe' -m pip install -r requirements.txt -q }
} else {
    Write-Host 'WARNING: could not find or create ai-service/venv.' -ForegroundColor Red
}

Write-Host ''
Write-Host 'Dependencies ready.' -ForegroundColor Green