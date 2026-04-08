$ErrorActionPreference = "Stop"

$statusLines = cmd /c "npx supabase status -o env 2>nul"
if ($LASTEXITCODE -ne 0) {
  throw "Konnte die lokalen Supabase-Umgebungswerte nicht lesen."
}

$values = @{}
foreach ($line in $statusLines) {
  if ($line -match '^[A-Z0-9_]+=') {
    $parts = $line.Split('=', 2)
    $values[$parts[0]] = $parts[1].Trim('"')
  }
}

$envPath = Join-Path $PSScriptRoot "..\.env.local"
$resolvedEnvPath = [System.IO.Path]::GetFullPath($envPath)
$markerStart = "# >>> local supabase >>>"
$markerEnd = "# <<< local supabase <<<"

$block = @(
  $markerStart,
  "NEXT_PUBLIC_SUPABASE_URL=$($values["API_URL"])",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($values["ANON_KEY"])",
  "SUPABASE_SERVICE_ROLE_KEY=$($values["SERVICE_ROLE_KEY"])",
  "DATABASE_URL=$($values["DB_URL"])",
  "SUPABASE_DB_SCHEMA=public",
  $markerEnd
) -join "`r`n"

$existing = if (Test-Path $resolvedEnvPath) {
  Get-Content $resolvedEnvPath -Raw
} else {
  ""
}

if ($existing -match [regex]::Escape($markerStart) + '[\s\S]*?' + [regex]::Escape($markerEnd)) {
  $updated = [regex]::Replace(
    $existing,
    [regex]::Escape($markerStart) + '[\s\S]*?' + [regex]::Escape($markerEnd),
    [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $block }
  )
} else {
  $trimmed = $existing.TrimEnd()
  if ($trimmed.Length -gt 0) {
    $updated = $trimmed + "`r`n`r`n" + $block + "`r`n"
  } else {
    $updated = $block + "`r`n"
  }
}

Set-Content -Path $resolvedEnvPath -Value $updated
Write-Host ".env.local wurde mit lokalen Supabase-Werten aktualisiert."