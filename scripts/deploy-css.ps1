# Publish assets/ (css.css + _headers) to Cloudflare Pages project "ncll-assets" (NCLL's own Cloudflare account,
# wrangler logged in as admin@ncllball.com with Pages-only scopes), then check the live file matches.
# Usage: pwsh -File scripts\deploy-css.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Push-Location $repo
try {
    # A "*/" inside a comment (e.g. a path like "Programs/*/x") ends it early and the leftover text silently kills
    # the next rule (it broke every rules page's headings on 2026-10-29). Refuse to deploy if any is left over.
    $css = [IO.File]::ReadAllText((Join-Path $repo 'assets\css.css'))
    $stray = [regex]::Matches([regex]::Replace($css, '(?s)/\*.*?\*/', ''), '\*/')
    if ($stray.Count) { throw "assets/css.css has $($stray.Count) stray '*/' outside a comment (a comment closed early); fix it before deploying" }
    $braces = [regex]::Replace($css, '(?s)/\*.*?\*/', '')
    if (([regex]::Matches($braces, '\{')).Count -ne ([regex]::Matches($braces, '\}')).Count) { throw "assets/css.css has unbalanced { } braces; fix it before deploying" }
    npx --yes wrangler@4 pages deploy assets --project-name ncll-assets --branch main --commit-dirty=true 2>&1 | Select-Object -Last 2
    $local = [IO.File]::ReadAllText((Join-Path $repo 'assets\css.css'))
    for ($i = 0; $i -lt 10; $i++) {
        $live = (Invoke-WebRequest "https://assets.ncllball.com/css.css?v=$(Get-Random)" -UseBasicParsing).Content
        if ($live -eq $local) { "Live: https://assets.ncllball.com/css.css matches assets/css.css"; return }
        Start-Sleep 2
    }
    throw "Deployed, but the live css.css doesn't match assets/css.css yet"
} finally { Pop-Location }
