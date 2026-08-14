#Requires -Version 5.1
# Kills any leftover Skill_Guide dev servers listening on ports 5173 (Vite),
# 5000 (Express), and 8000 (FastAPI/uvicorn). Safe to re-run.
# Also stops the uvicorn --reload parent so it does not respawn the server.

$ErrorActionPreference = 'SilentlyContinue'

$ports = @(5173, 5000, 8000)
foreach ($port in $ports) {
    Get-NetTCPConnection -State Listen -LocalPort $port | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force
    }
}

Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
    Where-Object { $_.CommandLine -like '*uvicorn app.main:app*' } |
    ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
    }

Write-Host 'Old dev servers stopped (ports 5173, 5000, 8000 are free).'