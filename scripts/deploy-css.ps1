# Publish assets/ (css.css + _headers) to Cloudflare Pages project "ncll-assets" (NCLL's own Cloudflare account,
# wrangler logged in as admin@ncllball.com with Pages-only scopes), then check the live file matches.
# Usage: pwsh -File scripts\deploy-css.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Push-Location $repo
try {
    npx --yes wrangler@4 pages deploy assets --project-name ncll-assets --branch main --commit-dirty=true 2>&1 | Select-Object -Last 2
    $local = [IO.File]::ReadAllText((Join-Path $repo 'assets\css.css'))
    for ($i = 0; $i -lt 10; $i++) {
        $live = (Invoke-WebRequest "https://ncll-assets.pages.dev/css.css?v=$(Get-Random)" -UseBasicParsing).Content
        if ($live -eq $local) { "Live: https://ncll-assets.pages.dev/css.css matches assets/css.css"; return }
        Start-Sleep 2
    }
    throw "Deployed, but the live css.css doesn't match assets/css.css yet"
} finally { Pop-Location }
