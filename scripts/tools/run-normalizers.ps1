<#!
.SYNOPSIS
    Convenience runner for site normalizers. Auto-detects repo root and runs selected scripts with optional --path and --write.

.DESCRIPTION
    This PowerShell helper locates the repository root based on this script's location (…/scripts/tools/),
    changes to that directory, and runs one or more normalizer scripts:
    - scripts/costs/normalize-cost-format.js
    - scripts/footnotes/normalize-scholarship-footies.js
    - scripts/costs/normalize-free-cost.js (optional)

    Use -Path to limit changes to a subdirectory (e.g., "Player Development").
    Use -Apply to add --write (otherwise runs dry-run).
    Use -Tasks to choose which normalizers to run (default: cost,footies).

.PARAMETER Path
    Relative path within the repo to limit the scope (default: "Player Development").

.PARAMETER Apply
    If specified, passes --write to scripts (default: dry-run).

.PARAMETER Tasks
    One or more of: cost, footies, free-cost, all. Default: cost,footies.

.EXAMPLE
    pwsh -File scripts/tools/run-normalizers.ps1 -Path "Player Development"

.EXAMPLE
    pwsh -File scripts/tools/run-normalizers.ps1 -Path "Player Development" -Apply

.EXAMPLE
    pwsh -File scripts/tools/run-normalizers.ps1 -Tasks cost -Path "2025 Season" -Apply
#>

param(
    [Alias('Area')]
    [string]$Path = "Player Development",

    [switch]$Apply,

    [ValidateSet('cost','footies','free-cost','all')]
    [string[]]$Tasks = @('cost','footies')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-RepoRoot {
    # This script lives at …/scripts/tools/run-normalizers.ps1 → repo root is two levels up
    $root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
    return $root.Path
}

function Invoke-Normalizer {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [Parameter(Mandatory=$true)][string]$RepoRoot,
        [string]$ScopePath,
        [switch]$DoWrite
    )

    $scriptMap = @{
        'cost'      = 'scripts/costs/normalize-cost-format.js'
        'footies'   = 'scripts/footnotes/normalize-scholarship-footies.js'
        'free-cost' = 'scripts/costs/normalize-free-cost.js'
    }

    if ($Name -eq 'all') {
        $null = Invoke-Normalizer -Name 'cost'      -RepoRoot $RepoRoot -ScopePath $ScopePath -DoWrite:$DoWrite
        $null = Invoke-Normalizer -Name 'footies'   -RepoRoot $RepoRoot -ScopePath $ScopePath -DoWrite:$DoWrite
        $null = Invoke-Normalizer -Name 'free-cost' -RepoRoot $RepoRoot -ScopePath $ScopePath -DoWrite:$DoWrite
        return
    }

    if (-not $scriptMap.ContainsKey($Name)) {
        Write-Warning "Unknown task '$Name' — skipping"
        return
    }

    $rel = $scriptMap[$Name]
    $full = Join-Path $RepoRoot $rel
    if (-not (Test-Path $full)) {
        Write-Error "Script not found: $rel"
    }

    $nodeArgs = @($rel, '--path', $ScopePath, '--verbose')
    if ($DoWrite) { $nodeArgs += '--write' }

    Write-Host "→ Running: node $($nodeArgs -join ' ')" -ForegroundColor Cyan
    & node @nodeArgs
}

try {
    # Ensure Node is available
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js executable 'node' not found in PATH. Please install Node.js and ensure it's on your PATH."
    }

    $repoRoot = Resolve-RepoRoot
    Push-Location $repoRoot
    Write-Host "Repo root:" (Get-Location).Path -ForegroundColor Yellow

    $writeSwitch = $false
    if ($Apply) { $writeSwitch = $true }

    foreach ($t in $Tasks) {
        Invoke-Normalizer -Name $t -RepoRoot $repoRoot -ScopePath $Path -DoWrite:$writeSwitch
    }

    Write-Host "All requested tasks completed." -ForegroundColor Green
}
catch {
    Write-Error $_
    exit 1
}
finally {
    Pop-Location | Out-Null
}
