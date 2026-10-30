Set-StrictMode -Version Latest
function Test-LocalPackage([string]$Directory) {
    $root = [IO.Path]::GetFullPath($Directory).TrimEnd('\','/')
    $manifest = Get-Content -LiteralPath (Join-Path $root 'package-manifest.json') -Raw | ConvertFrom-Json
    if ($manifest.schema -ne 1 -or $manifest.scope -ne 'local-evaluation-only' -or $manifest.publicRedistributionApproved -ne $false) { throw 'Invalid local evaluation scope.' }
    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($file in $manifest.files) {
        if ($file.path -match '(^|/)\.\.?(/|$)|[:\\]' -or $file.path -match '(?i)(^|/)(library\.json|\.env|.*\.(mkv|mp4|srt|log))$') { throw 'Unsafe package entry.' }
        $path = [IO.Path]::GetFullPath((Join-Path $root $file.path))
        if (-not $path.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or -not $seen.Add($path)) { throw 'Duplicate or escaped package entry.' }
        if ($file.sha256 -notmatch '^[A-Fa-f0-9]{64}$' -or (Get-FileHash -LiteralPath $path).Hash -ne $file.sha256 -or (Get-Item -LiteralPath $path).Length -ne $file.bytes) { throw 'Package file integrity failure.' }
    }
    foreach ($file in Get-ChildItem -LiteralPath $root -Recurse -File) {
        if ($file.Name -eq 'package-manifest.json' -and $file.DirectoryName -eq $root) { continue }
        if (-not $seen.Contains($file.FullName)) { throw 'Unlisted package payload.' }
    }
    if ($seen.Count -eq 0) { throw 'Empty package.' }
    return $seen.Count
}
Export-ModuleMember -Function Test-LocalPackage
