$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$workspaceRoot = Resolve-Path (Join-Path $projectRoot "..")
$zipPath = Join-Path $workspaceRoot "YOJHAN-STORE-RAILWAY-FINAL.zip"

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

$items = Get-ChildItem -LiteralPath $projectRoot -Force |
  Where-Object { $_.Name -ne "node_modules" }

Compress-Archive -Path $items.FullName -DestinationPath $zipPath -Force
Write-Output $zipPath
