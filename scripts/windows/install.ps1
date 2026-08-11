# Workout Planner - one-time setup for Windows.
#
# What this does, in order:
#   1. Installs Node.js and Docker Desktop if they aren't already installed.
#   2. Turns on WSL2 (Docker Desktop needs it) if it isn't already on.
#   3. Starts Docker Desktop and the app's database.
#   4. Installs the app and sets up the database tables.
#   5. Builds the app and makes it start automatically every time you log in.
#
# You do not need to know what any of that means. Just double-click
# Install.bat and follow any messages this window shows you.
#
# Safe to run more than once - it skips anything that's already done.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    $msg" -ForegroundColor Yellow }
function Stop-WithMessage($msg) {
    Write-Host "`n$msg" -ForegroundColor Red
    Read-Host "`nPress Enter to close this window"
    exit 1
}

# --- This needs Administrator rights (to install software and register  ---
# --- the auto-start task). Relaunch itself elevated if it isn't already. ---
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This needs to run as Administrator - restarting with admin rights (click Yes on the prompt)..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Update-SessionPath {
    $machine = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $user = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machine;$user"
}

# --- winget (Windows Package Manager) ---
Write-Step "Checking for the Windows Package Manager (winget)"
if (-not (Test-Command "winget")) {
    Stop-WithMessage "winget isn't available on this PC. Please install 'App Installer' from the Microsoft Store (search 'App Installer'), then double-click Install.bat again.`nDirect link: https://apps.microsoft.com/detail/9nblggh4nns1"
}
Write-Ok "Found winget."

# --- Node.js ---
Write-Step "Checking for Node.js"
if (-not (Test-Command "node")) {
    Write-Host "    Installing Node.js LTS (a few minutes)..."
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements | Out-Host
    Update-SessionPath
} else {
    Write-Ok "Already installed ($(node -v))."
}
if (-not (Test-Command "node")) {
    Stop-WithMessage "Node.js was installed but this window can't see it yet. Close this window and double-click Install.bat again."
}

# --- Docker Desktop ---
Write-Step "Checking for Docker Desktop"
if (-not (Test-Command "docker")) {
    Write-Host "    Installing Docker Desktop (this can take several minutes)..."
    winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements | Out-Host
    Update-SessionPath
} else {
    Write-Ok "Already installed."
}

# Docker Desktop needs WSL2. Turn it on if it's missing (needs a restart to finish).
Write-Step "Checking Windows features Docker needs (WSL2)"
$wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
$vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
$needsReboot = $false
if ($wslFeature.State -ne "Enabled") {
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart | Out-Null
    $needsReboot = $true
}
if ($vmFeature.State -ne "Enabled") {
    Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart | Out-Null
    $needsReboot = $true
}
if ($needsReboot) {
    Stop-WithMessage "Windows needs to restart once to finish turning on WSL2 (needed by Docker).`n`nPlease restart your computer, then double-click Install.bat again - it will pick up right where it left off."
}
Write-Ok "WSL2 is on."

# --- Start Docker Desktop and wait until it's ready ---
Write-Step "Starting Docker Desktop"
$dockerExe = "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue) -and (Test-Path $dockerExe)) {
    Start-Process $dockerExe
}
Write-Host "    Waiting for Docker to finish starting (can take a minute or two the first time)..."
$dockerReady = $false
for ($i = 0; $i -lt 60; $i++) {
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { $dockerReady = $true; break }
    Start-Sleep -Seconds 5
}
if (-not $dockerReady) {
    Stop-WithMessage "Docker Desktop didn't finish starting. Open it manually from the Start menu, wait until it says 'Engine running', then double-click Install.bat again."
}
Write-Ok "Docker is ready."

# --- Project setup ---
Set-Location $ProjectRoot

Write-Step "Setting up local configuration"
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Ok "Created .env"
} else {
    Write-Ok ".env already exists."
}

Write-Step "Starting the database"
docker compose up -d
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Could not start the database container." }
Write-Ok "Database container is running."

Write-Step "Installing the app's dependencies (this can take a few minutes the first time)"
npm ci
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "npm ci failed - see the errors above." }

Write-Step "Preparing the database client"
npx prisma generate
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "prisma generate failed - see the errors above." }

Write-Step "Setting up the database tables"
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Database setup failed - see the errors above." }

Write-Step "Building the app"
npm run build
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Build failed - see the errors above." }

# --- Make it start automatically every time this person logs in ---
Write-Step "Setting the app to start automatically when you log in to Windows"
$taskName = "WorkoutPlanner"
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$PSScriptRoot\run-app.ps1`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId "$env:UserDomain\$env:UserName" -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Ok "Done - Workout Planner will now start automatically every time you log in."

# --- Start it right now, too ---
Write-Step "Starting Workout Planner"
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "`nAll set!" -ForegroundColor Green
Write-Host "Workout Planner is running at http://localhost:3000 and will keep running in the background." -ForegroundColor Green
Write-Host "It will start itself automatically every time you log in - you never need to run this again." -ForegroundColor Green
Read-Host "`nPress Enter to close this window"
