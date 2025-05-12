# PowerShell helper to copy values and optionally commit to Git
param(
  [string]$Env = "dev",
  [string]$TargetPath = "../config-repo/helm/values-$Env.yaml",
  [switch]$Commit
)

$sourcePath = "./values-examples/$Env.yaml"
Copy-Item -Path $sourcePath -Destination $TargetPath -Force
Write-Host "Saved $Env values.yaml to $TargetPath"

if ($Commit) {
  Set-Location ../config-repo
  git add $TargetPath
  git commit -m "Update values for $Env via script"
  git push
  Write-Host "Committed and pushed changes for $Env"
}