#requires -Version 7.4
param()
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$desktop = Split-Path $PSScriptRoot -Parent
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_NOLOGO = '1'

function Assert-PlainPath([string]$path) {
    $node = Get-Item -LiteralPath $path -Force
    while ($node) {
        if ($node.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse paths are not allowed.' }
        $node = $node.Parent
    }
}
Assert-PlainPath $desktop
$artifactRoot = Join-Path $desktop 'TestArtifacts'
if (-not (Test-Path -LiteralPath $artifactRoot)) { New-Item -ItemType Directory $artifactRoot | Out-Null }
Assert-PlainPath $artifactRoot
$output = Join-Path $artifactRoot ('package-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $output | Out-Null
$stage = Join-Path $output 'CineMate-local-win-x64'
New-Item -ItemType Directory $stage | Out-Null
$publish = Join-Path $output 'publish'
Push-Location $desktop
try {
    & dotnet restore CineMate.Desktop/CineMate.Desktop.csproj --locked-mode --source https://api.nuget.org/v3/index.json
    if ($LASTEXITCODE -ne 0) { throw 'Locked restore failed.' }
    & dotnet publish CineMate.Desktop/CineMate.Desktop.csproj -c Release --no-restore -o $publish -p:PublishSingleFile=false -p:PublishTrimmed=false
    if ($LASTEXITCODE -ne 0) { throw 'Publish failed.' }
} finally { Pop-Location }

# Copy only fresh publish output, never a checkout, user data or test fixtures.
foreach ($file in Get-ChildItem -LiteralPath $publish -Recurse -File) {
    if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Unexpected publish link.' }
    $relative = [IO.Path]::GetRelativePath($publish, $file.FullName)
    $target = Join-Path $stage $relative
    New-Item -ItemType Directory -Force (Split-Path $target -Parent) | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $target
}
foreach ($required in @('CineMate.exe', 'LibVLCSharp.dll', 'LibVLCSharp.WPF.dll', 'libvlc/win-x64/libvlc.dll', 'libvlc/win-x64/libvlccore.dll')) {
    if (-not (Test-Path -LiteralPath (Join-Path $stage $required) -PathType Leaf)) { throw "Missing package file: $required" }
}
$licenses = Join-Path $stage 'licenses'
New-Item -ItemType Directory $licenses | Out-Null
$lgpl = Join-Path $PSScriptRoot 'licenses/LGPL-2.1.txt'
if ((Get-FileHash -LiteralPath $lgpl -Algorithm SHA256).Hash -ne 'DC626520DCD53A22F727AF3EE42C770E56C97A64FE3ADB063799D8AB032FE551') { throw 'LGPL text integrity failure.' }
Copy-Item -LiteralPath $lgpl -Destination $licenses
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'NOTICE.md') -Destination (Join-Path $stage 'NOTICE.md')
$assets = Get-Content -LiteralPath (Join-Path $desktop 'CineMate.Desktop/obj/project.assets.json') -Raw | ConvertFrom-Json
$cacheRoots = @($assets.packageFolders.PSObject.Properties.Name)
$components = @()
$expected = @('LibVLCSharp/3.10.1', 'LibVLCSharp.WPF/3.10.1', 'VideoLAN.LibVLC.Windows/3.0.24')
$packages = @($assets.libraries.PSObject.Properties | Where-Object { $_.Value.type -eq 'package' })
if ((($packages.Name | Sort-Object) -join ',') -ne (($expected | Sort-Object) -join ',')) { throw 'Unexpected NuGet dependency graph.' }
foreach ($package in $packages) {
    $parts = $package.Name.Split('/')
    $id = $parts[0]; $version = $parts[1]
    $directory = $null
    foreach ($root in $cacheRoots) {
        $candidate = Join-Path $root $package.Value.path
        if (Test-Path -LiteralPath $candidate) { $directory = $candidate; break }
    }
    if (-not $directory) { throw 'Package cache missing.' }
    $archive = Join-Path $directory ($id.ToLowerInvariant() + '.' + $version + '.nupkg')
    $sha512 = [Convert]::ToBase64String([Security.Cryptography.SHA512]::HashData([IO.File]::ReadAllBytes($archive)))
    $cachedArchiveHash = (Get-Content -LiteralPath ($archive + '.sha512') -Raw).Trim()
    if ($sha512 -ne $cachedArchiveHash) { throw 'NuGet archive integrity mismatch.' }
    & dotnet nuget verify $archive --all
    if ($LASTEXITCODE -ne 0) { throw 'NuGet signature verification failed.' }
    Copy-Item -LiteralPath (Join-Path $directory ($id.ToLowerInvariant() + '.nuspec')) -Destination $licenses
    # Verify published vendor bytes against the signed archive, not just cache metadata.
    $zipReader = [IO.Compression.ZipFile]::OpenRead($archive)
    try {
        foreach ($entry in $zipReader.Entries) {
            $targetName = $null
            if ($id -eq 'LibVLCSharp' -and $entry.FullName -eq 'lib/net8.0/LibVLCSharp.dll') { $targetName = 'LibVLCSharp.dll' }
            if ($id -eq 'LibVLCSharp.WPF' -and $entry.FullName -eq 'lib/net6.0-windows7.0/LibVLCSharp.WPF.dll') { $targetName = 'LibVLCSharp.WPF.dll' }
            if ($id -eq 'VideoLAN.LibVLC.Windows' -and $entry.FullName -match '^build/x64/(libvlc(core)?\.[^/]+|(hrtfs|lua|plugins)/.+)$') { $targetName = 'libvlc/win-x64/' + $entry.FullName.Substring(10) }
            if ($targetName -and -not $entry.FullName.EndsWith('/')) {
                $target = Join-Path $stage $targetName
                if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { throw 'Published vendor file missing.' }
                $entryStream = $entry.Open()
                try { $expectedHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($entryStream)) } finally { $entryStream.Dispose() }
                if ((Get-FileHash -LiteralPath $target).Hash -ne $expectedHash) { throw 'Published vendor bytes differ from signed archive.' }
            }
        }
    } finally { $zipReader.Dispose() }
    $components += [ordered]@{name=$id; version=$version; purl="pkg:nuget/$id@$version"; license='LGPL-2.1-or-later'; signedArchiveSha512=$sha512; nugetContentHash=$package.Value.sha512}
}
# Runtime pack licenses are shipped verbatim, not re-labelled as LGPL.
foreach ($runtime in @('microsoft.netcore.app.runtime.win-x64', 'microsoft.windowsdesktop.app.runtime.win-x64')) {
    $directory = $null
    foreach ($root in $cacheRoots) {
        $candidate = Join-Path $root "$runtime/8.0.22"
        if (Test-Path -LiteralPath $candidate) { $directory = $candidate; break }
    }
    if (-not $directory) { throw 'Pinned runtime pack missing.' }
    & dotnet nuget verify (Join-Path $directory "$runtime.8.0.22.nupkg") --all
    if ($LASTEXITCODE -ne 0) { throw 'Runtime pack signature verification failed.' }
    $runtimeLicenses = @(Get-ChildItem -LiteralPath $directory -File | Where-Object { $_.Name -match '^(LICENSE|THIRD-PARTY-NOTICES)' })
    if (-not $runtimeLicenses.Count) { throw 'Runtime license missing.' }
    foreach ($file in $runtimeLicenses) { Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $licenses ($runtime + '-' + $file.Name)) }
    $components += [ordered]@{name=$runtime; version='8.0.22'; license='See verbatim runtime notices'; sha256=(Get-FileHash (Join-Path $directory "$runtime.8.0.22.nupkg")).Hash}
}
$inventory = @()
foreach ($file in Get-ChildItem -LiteralPath $stage -Recurse -File | Sort-Object FullName) {
    $relative = [IO.Path]::GetRelativePath($stage, $file.FullName).Replace('\','/')
    if ($relative -match '(?i)(^|/)(library\.json|\.env|.*\.(mkv|mp4|srt)|.*\.log)$') { throw 'Private/test payload in package.' }
    $inventory += [ordered]@{path=$relative; bytes=$file.Length; sha256=(Get-FileHash -LiteralPath $file.FullName).Hash}
}
$receipt = [ordered]@{schema=1; scope='local-evaluation-only'; publicRedistributionApproved=$false; sdk='8.0.416'; rid='win-x64'; runtime='8.0.22'; components=$components; files=$inventory; nativeComponentLicenseAuditComplete=$false}
[IO.File]::WriteAllText((Join-Path $stage 'package-manifest.json'), ($receipt | ConvertTo-Json -Depth 8) + "`n", [Text.UTF8Encoding]::new($false))
Import-Module (Join-Path $PSScriptRoot 'package-validation.psm1') -Force
$null = Test-LocalPackage $stage

# Stable ordering and timestamps: same build inputs produce a repeatable ZIP.
Add-Type -AssemblyName System.IO.Compression
$zip = Join-Path $output 'CineMate-local-win-x64.zip'
$stream = [IO.File]::Open($zip, [IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in Get-ChildItem -LiteralPath $stage -Recurse -File | Sort-Object FullName) {
        $name = [IO.Path]::GetRelativePath($stage, $file.FullName).Replace('\','/')
        $entry = $archive.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]::new(2000,1,1,0,0,0,[TimeSpan]::Zero)
        $input = [IO.File]::OpenRead($file.FullName); $destination = $entry.Open()
        try { $input.CopyTo($destination) } finally { $destination.Dispose(); $input.Dispose() }
    }
} finally { $archive.Dispose(); $stream.Dispose() }
[ordered]@{zip=$zip; sha256=(Get-FileHash -LiteralPath $zip).Hash; manifest=(Join-Path $stage 'package-manifest.json'); files=$inventory.Count} | ConvertTo-Json
