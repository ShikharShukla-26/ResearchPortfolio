# One-time: store VERCEL_TOKEN in GitHub Actions secrets (requires gh auth login).
param(
  [Parameter(Mandatory = $true)]
  [string]$VercelToken
)

$ErrorActionPreference = 'Stop'
$repo = 'ShikharShukla-26/ResearchPortfolio'

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Run: gh auth login -h github.com -p https -w'
  exit 1
}

$VercelToken | gh secret set VERCEL_TOKEN --repo $repo
Write-Host "Set VERCEL_TOKEN on $repo. Push to main or run the Sync Vercel production aliases workflow."
