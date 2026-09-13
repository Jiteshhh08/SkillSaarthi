# Deploy ai-service/ to a Hugging Face Docker Space.
#
# Usage:
#   .\scripts\deploy-hf-ai.ps1 -HfUser <your-hf-username> [-SpaceName skillsaarthi-ai]
#
# Pushes only the ai-service/ directory (git subtree) to the Space's main
# branch. Run it from anywhere inside the repo. Credentials: HF username +
# a write token when git prompts for a password.

param(
  [Parameter(Mandatory = $true)][string]$HfUser,
  [string]$SpaceName = "skillsaarthi-ai",
  [string]$Remote = "hf"
)

$ErrorActionPreference = "Stop"
$url = "https://huggingface.co/spaces/$HfUser/$SpaceName"

git rev-parse --is-inside-work-tree | Out-Null
if (-not $?) { throw "Not inside a git repository." }

$existing = git remote get-url $Remote 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Adding remote '$Remote' -> $url"
  git remote add $Remote $url
} elseif ($existing -ne $url) {
  Write-Host "Updating remote '$Remote' -> $url"
  git remote set-url $Remote $url
}

Write-Host "Pushing ai-service/ to $url ..."
git subtree push --prefix ai-service $Remote main
if ($LASTEXITCODE -eq 0) { Write-Host "Done."; exit 0 }

Write-Host "Fast-forward rejected (history diverged). Retrying with a split + force push..."
$split = git subtree split --prefix ai-service main
if ($LASTEXITCODE -ne 0) { throw "git subtree split failed." }
git push $Remote "${split}:main" --force
if ($LASTEXITCODE -ne 0) { throw "Push to Hugging Face failed." }
Write-Host "Done."
