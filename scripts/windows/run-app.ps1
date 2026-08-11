# Runs Workout Planner. This is what the auto-start task launches at every
# login - you shouldn't need to run this by hand. If you do, it's safe:
# it makes sure the database is up, then keeps the app running, restarting
# it automatically if it ever stops.

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

$machine = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$user = [System.Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$machine;$user"

# Make sure Docker Desktop is running.
$dockerExe = "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue) -and (Test-Path $dockerExe)) {
    Start-Process $dockerExe
}

for ($i = 0; $i -lt 60; $i++) {
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 5
}

docker compose up -d *> $null

# Keep the app running. If it ever crashes or Windows updates something
# underneath it, this brings it back up instead of leaving it stopped.
while ($true) {
    npm run start
    Start-Sleep -Seconds 5
}
