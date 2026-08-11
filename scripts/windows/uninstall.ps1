# Turns off Workout Planner's auto-start and stops the database.
# Node.js and Docker Desktop themselves are left installed.

$ErrorActionPreference = "Stop"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

Write-Host "Turning off auto-start..." -ForegroundColor Cyan
Unregister-ScheduledTask -TaskName "WorkoutPlanner" -Confirm:$false -ErrorAction SilentlyContinue

Write-Host "Stopping the database..." -ForegroundColor Cyan
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot
docker compose down

Write-Host "`nDone. Workout Planner will no longer start automatically." -ForegroundColor Green
Write-Host "(Node.js and Docker Desktop were left installed. Run Install.bat again any time to turn it back on.)" -ForegroundColor Green
Read-Host "`nPress Enter to close this window"
