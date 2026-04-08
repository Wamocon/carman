$ErrorActionPreference = "Stop"

$attempts = 2

for ($attempt = 1; $attempt -le $attempts; $attempt++) {
  npx supabase db reset --local --no-seed

  if ($LASTEXITCODE -eq 0) {
    exit 0
  }

  if ($attempt -lt $attempts) {
    Write-Host "Lokaler DB-Reset ist fehlgeschlagen. Stelle Stack wieder her und versuche es erneut..."
    & "$PSScriptRoot\ensure-local-supabase.ps1" -SyncEnv
  }
}

throw "Lokaler DB-Reset ist auch nach erneutem Versuch fehlgeschlagen."