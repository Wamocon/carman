param(
  [switch]$SyncEnv
)

$ErrorActionPreference = "Stop"

function Test-DockerReady {
  cmd /c "docker info >nul 2>nul"
  return $LASTEXITCODE -eq 0
}

function Start-DockerDesktopIfNeeded {
  $dockerDesktop = Join-Path $Env:ProgramFiles "Docker\Docker\Docker Desktop.exe"

  if (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue) {
    return
  }

  if (-not (Test-Path $dockerDesktop)) {
    throw "Docker Desktop konnte nicht gefunden werden."
  }

  Write-Host "Docker laeuft nicht. Starte Docker Desktop..."
  Start-Process -FilePath $dockerDesktop

  $deadline = (Get-Date).AddMinutes(2)
  while ((Get-Date) -lt $deadline) {
    if (Test-DockerReady) {
      return
    }

    [System.Threading.Thread]::Sleep(2000)
  }

  throw "Docker Desktop wurde gestartet, ist aber noch nicht bereit."
}

function Test-SupabaseRunning {
  cmd /c "npx supabase status >nul 2>nul"
  return $LASTEXITCODE -eq 0
}

if (-not (Test-DockerReady)) {
  Start-DockerDesktopIfNeeded
}

if (-not (Test-SupabaseRunning)) {
  Write-Host "Supabase-Container laufen nicht. Starte lokalen Stack..."
  npx supabase start
  if ($LASTEXITCODE -ne 0) {
    throw "Lokaler Supabase-Stack konnte nicht gestartet werden."
  }
}

if ($SyncEnv) {
  & "$PSScriptRoot\sync-local-supabase-env.ps1"
}