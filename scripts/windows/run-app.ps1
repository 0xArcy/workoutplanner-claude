# Runs Workout Planner. This is what the auto-start task launches at every
# login - you shouldn't need to run this by hand. If you do, it's safe:
# it makes sure the database service is running, then keeps the app running,
# restarting it automatically if it ever stops.

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

$machine = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$user = [System.Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$machine;$user"

# PostgreSQL runs as a Windows service and starts on its own at boot, but
# make sure it's actually running in case it was stopped for some reason.
$pgService = Get-Service -Name "postgresql-workoutplanner" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -ne "Running") {
    Start-Service -Name "postgresql-workoutplanner"
}

# Keep the app running. If it ever crashes or Windows updates something
# underneath it, this brings it back up instead of leaving it stopped.
while ($true) {
    npm run start
    Start-Sleep -Seconds 5
}
