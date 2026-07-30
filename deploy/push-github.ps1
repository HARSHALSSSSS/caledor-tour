# One-time script: login to GitHub, create repo, push code
# Run in PowerShell from project folder:  .\deploy\push-github.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$ghZip = "$env:TEMP\gh.zip"
$ghDir = "$env:TEMP\gh-cli"
$ghExe = "$ghDir\bin\gh.exe"

if (-not (Test-Path $ghExe)) {
  Write-Host "Downloading GitHub CLI..."
  Invoke-WebRequest -Uri "https://github.com/cli/cli/releases/download/v2.65.0/gh_2.65.0_windows_amd64.zip" -OutFile $ghZip
  Expand-Archive -Path $ghZip -DestinationPath $ghDir -Force
}

Write-Host "Step 1: Log in to GitHub (browser will open)..."
& $ghExe auth login -h github.com -p https -w

Write-Host "Step 2: Create repo and push..."
& $ghExe repo create caledor-tour --public --source=. --remote=origin --push

Write-Host ""
Write-Host "Done! Your repo:"
& $ghExe repo view --web
