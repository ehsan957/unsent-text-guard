# Builds the store packages into dist\ (Windows PowerShell 5.1 or PowerShell 7).
#   dist\chrome-edge\  and  dist\firefox\   unpacked, for testing
#   dist\unsent-text-guard-chrome-edge-<version>.zip
#   dist\unsent-text-guard-firefox-<version>.zip
# Zip entries are written with forward slashes, which Firefox Add-ons requires
# (Compress-Archive in Windows PowerShell 5.1 writes backslashes and gets rejected).
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$Name = 'unsent-text-guard'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-Version($Path) { (Get-Content $Path -Raw -Encoding UTF8 | ConvertFrom-Json).version }
$vChrome  = Get-Version 'platform/chrome/manifest.json'
$vFirefox = Get-Version 'platform/firefox/manifest.json'
if ($vChrome -ne $vFirefox) { throw "Version mismatch: chrome $vChrome, firefox $vFirefox" }

$dist = Join-Path $PSScriptRoot 'dist'
if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item $dist -ItemType Directory | Out-Null

foreach ($p in @(@{ Dir = 'chrome'; Label = 'chrome-edge' }, @{ Dir = 'firefox'; Label = 'firefox' })) {
  $out = Join-Path $dist $p.Label
  New-Item $out -ItemType Directory | Out-Null
  Copy-Item (Join-Path 'src' '*') $out -Recurse
  Copy-Item (Join-Path (Join-Path 'platform' $p.Dir) '*') $out -Recurse -Force   # platform files override shared ones

  $zipPath = Join-Path $dist "$Name-$($p.Label)-$vChrome.zip"
  $outFull = (Resolve-Path $out).Path
  $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    Get-ChildItem $out -Recurse -File | ForEach-Object {
      $entry = $_.FullName.Substring($outFull.Length + 1).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  } finally {
    $zip.Dispose()
  }
  Write-Host "Built dist\$Name-$($p.Label)-$vChrome.zip"
}
