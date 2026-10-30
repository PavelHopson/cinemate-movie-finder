#requires -Version 7.4
param([Parameter(Mandatory=$true)][string]$PackageDirectory)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'package-validation.psm1') -Force
$count = Test-LocalPackage $PackageDirectory
Write-Output "PASS real package inventory: $count files"
$root = Join-Path ([IO.Path]::GetTempPath()) ('CineMate-contract-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $root | Out-Null
$payload = Join-Path $root 'sample.dll'
[IO.File]::WriteAllText($payload, 'neutral test bytes')
$file = @{path='sample.dll'; bytes=(Get-Item $payload).Length; sha256=(Get-FileHash $payload).Hash}
function Write-Fixture($files, [bool]$approved=$false) {
    $manifest = @{schema=1; scope='local-evaluation-only'; publicRedistributionApproved=$approved; files=@($files)}
    [IO.File]::WriteAllText((Join-Path $root 'package-manifest.json'), ($manifest | ConvertTo-Json -Depth 5))
}
function Expect-Reject([string]$name) {
    $rejected=$false
    try { $null = Test-LocalPackage $root } catch { $rejected=$true }
    if (-not $rejected) { throw "Negative contract accepted: $name" }
    Write-Output "PASS rejects $name"
}
Write-Fixture @($file)
if ((Test-LocalPackage $root) -ne 1) { throw 'Positive contract failed.' }
Write-Output 'PASS valid synthetic inventory'
Write-Fixture @($file) $true; Expect-Reject 'public redistribution flag'
Write-Fixture @($file,$file); Expect-Reject 'duplicate entries'
$escaped=$file.Clone(); $escaped.path='../sample.dll'; Write-Fixture @($escaped); Expect-Reject 'path traversal'
$hash=$file.Clone(); $hash.sha256='bad'; Write-Fixture @($hash); Expect-Reject 'invalid hash'
Write-Fixture @($file); [IO.File]::WriteAllText($payload, 'altered test bytes'); Expect-Reject 'altered bytes'
[IO.File]::WriteAllText($payload, 'neutral test bytes')
[IO.File]::WriteAllText((Join-Path $root 'extra.dll'), 'unexpected')
Write-Fixture @($file); Expect-Reject 'unlisted payload'
Write-Output 'RESULT 8 checks passed (real inventory + seven synthetic contracts)'
