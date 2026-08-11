# Workout Planner - one-time setup for Windows.
#
# No Docker and no WSL - the database runs as a normal Windows service.
#
# What this does, in order:
#   1. Installs Node.js and PostgreSQL if they aren't already installed.
#   2. Creates the app's database and database user.
#   3. Installs the app and sets up the database tables.
#   4. Builds the app and makes it start automatically every time you log in.
#
# You do not need to know what any of that means. Just double-click
# Install.bat and follow any messages this window shows you.
#
# Safe to run more than once - it skips anything that's already done.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$PgServiceName = "postgresql-workoutplanner"
$PgSuperPassword = "workoutplanner"
$PgPort = 5432
$AppDbUser = "workout"
$AppDbPassword = "workout"
$AppDbName = "workoutplanner"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "    $msg" -ForegroundColor Green }
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

# --- PostgreSQL, as a native Windows service (no Docker, no WSL) ---
Write-Step "Checking for PostgreSQL"
$pgService = Get-Service -Name $PgServiceName -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "    Installing PostgreSQL as a Windows service (a few minutes)..."
    $installerArgs = "--mode unattended --unattendedmodeui minimal " +
        "--superpassword $PgSuperPassword --servicename $PgServiceName " +
        "--serverport $PgPort --disable-components stackbuilder"
    winget install -e --id PostgreSQL.PostgreSQL --silent `
        --accept-package-agreements --accept-source-agreements `
        --override $installerArgs | Out-Host
    Start-Sleep -Seconds 5
    $pgService = Get-Service -Name $PgServiceName -ErrorAction SilentlyContinue
}
if (-not $pgService) {
    Stop-WithMessage "PostgreSQL installed but the '$PgServiceName' service wasn't found. Open 'Services' (search the Start menu) and check for a PostgreSQL service, then double-click Install.bat again."
}
if ($pgService.Status -ne "Running") {
    Set-Service -Name $PgServiceName -StartupType Automatic
    Start-Service -Name $PgServiceName
}
Write-Ok "PostgreSQL service is running."

# Find psql/createdb next to the service so we can set up the app's database.
$pgBin = $null
$candidate = Get-ChildItem "$Env:ProgramFiles\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | Select-Object -First 1
if ($candidate) { $pgBin = Join-Path $candidate.FullName "bin" }
if (-not $pgBin -or -not (Test-Path "$pgBin\psql.exe")) {
    Stop-WithMessage "Couldn't find PostgreSQL's psql.exe under Program Files\PostgreSQL. Please reinstall PostgreSQL and try again."
}

Write-Step "Setting up the app's database"
$env:PGPASSWORD = $PgSuperPassword
$psql = "$pgBin\psql.exe"

$roleExists = & $psql -U postgres -h localhost -p $PgPort -tA -c "SELECT 1 FROM pg_roles WHERE rolname='$AppDbUser'" 2>$null
if ($roleExists -ne "1") {
    & $psql -U postgres -h localhost -p $PgPort -c "CREATE ROLE $AppDbUser LOGIN PASSWORD '$AppDbPassword';" | Out-Null
    Write-Ok "Created database user."
} else {
    Write-Ok "Database user already exists."
}

$dbExists = & $psql -U postgres -h localhost -p $PgPort -tA -c "SELECT 1 FROM pg_database WHERE datname='$AppDbName'" 2>$null
if ($dbExists -ne "1") {
    & $psql -U postgres -h localhost -p $PgPort -c "CREATE DATABASE $AppDbName OWNER $AppDbUser;" | Out-Null
    Write-Ok "Created database."
} else {
    Write-Ok "Database already exists."
}
Remove-Item Env:\PGPASSWORD

# --- Project setup ---
Set-Location $ProjectRoot

Write-Step "Setting up local configuration"
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Ok "Created .env"
} else {
    Write-Ok ".env already exists."
}

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
Write-Ok "(PostgreSQL runs as its own Windows service and starts on its own at boot - nothing to remember there either.)"

# --- Start it right now, too ---
Write-Step "Starting Workout Planner"
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "`nAll set!" -ForegroundColor Green
Write-Host "Workout Planner is running at http://localhost:3000 and will keep running in the background." -ForegroundColor Green
Write-Host "It will start itself automatically every time you log in - you never need to run this again." -ForegroundColor Green
Read-Host "`nPress Enter to close this window"
