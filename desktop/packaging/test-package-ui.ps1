#requires -Version 5.1
param([Parameter(Mandatory=$true)][string]$ZipPath)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class CineMatePackageUI {
  private delegate bool EnumProc(IntPtr h, IntPtr p);
  [DllImport("user32.dll")] private static extern bool EnumWindows(EnumProc c, IntPtr p);
  [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] private static extern int GetWindowText(IntPtr h, StringBuilder t, int n);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, UIntPtr e);
  public static IntPtr Find(uint pid, string title) {
    IntPtr result=IntPtr.Zero;
    EnumWindows((h,p)=> { uint id; GetWindowThreadProcessId(h,out id); var t=new StringBuilder(512); GetWindowText(h,t,512);
      if(id==pid && t.ToString()==title) {result=h; return false;} return true; },IntPtr.Zero);
    return result;
  }
}
'@
$desktop = Split-Path $PSScriptRoot -Parent
$fixture = Join-Path $desktop 'TestArtifacts/synthetic-multitrack.mkv'
if ((Get-FileHash -LiteralPath $fixture).Hash -ne '3B7EC780F4031A698EA5A97F73BED9E01062DE645A38A816366FD94C99B6EE78') { throw 'Neutral fixture missing or changed.' }
$root = Join-Path ([IO.Path]::GetTempPath()) ('CineMate-acceptance-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $root | Out-Null
$app = Join-Path $root 'app'
$reader = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $ZipPath))
try {
    foreach ($entry in $reader.Entries) {
        $destination = [IO.Path]::GetFullPath((Join-Path $app $entry.FullName))
        if (-not $destination.StartsWith($app + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe ZIP entry.' }
    }
} finally { $reader.Dispose() }
Expand-Archive -LiteralPath $ZipPath -DestinationPath $app
Import-Module (Join-Path $PSScriptRoot 'package-validation.psm1') -Force
$null = Test-LocalPackage $app
$manifest = Get-Content -LiteralPath (Join-Path $app 'package-manifest.json') -Raw | ConvertFrom-Json
if ($manifest.publicRedistributionApproved -ne $false) { throw 'Not a local evaluation package.' }
foreach ($file in $manifest.files) {
    $path = [IO.Path]::GetFullPath((Join-Path $app $file.path))
    if (-not $path.StartsWith($app + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe manifest entry.' }
    if ((Get-FileHash -LiteralPath $path).Hash -ne $file.sha256) { throw 'Extracted file integrity failure.' }
}
$data = Join-Path $root 'data'; New-Item -ItemType Directory $data | Out-Null
$media = Join-Path $root 'neutral-fixture.mkv'; Copy-Item -LiteralPath $fixture -Destination $media
$library = Join-Path $data 'library.json'
# A synthetic library fixture, never the user's library or media files.
$item = @{ Id=[guid]::NewGuid().ToString(); Title='Neutral local fixture'; FilePath=$media; FileSizeBytes=(Get-Item $media).Length; ResumePositionMs=0; DurationMs=0; Volume=0; IsMuted=$true; IsCompleted=$false; AddedAt=[DateTimeOffset]::UtcNow.ToString('O') }
[IO.File]::WriteAllText($library, (ConvertTo-Json -InputObject @($item)), [Text.UTF8Encoding]::new($false))
$previousData = $env:CINEMATE_DATA_DIRECTORY
$process = $null
function Find-Control($window, [string]$value, [switch]$ById) {
    $property = [System.Windows.Automation.AutomationElement]::NameProperty
    if ($ById) { $property = [System.Windows.Automation.AutomationElement]::AutomationIdProperty }
    $condition = [System.Windows.Automation.PropertyCondition]::new($property, $value)
    $control = $window.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condition)
    if (-not $control) { throw "Control unavailable: $value" }
    return $control
}
function Invoke-Control($window, [string]$name) {
    (Find-Control $window $name).GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
}
function Wait-Window([string]$title) {
    $deadline = [DateTime]::UtcNow.AddSeconds(12)
    do {
        if ($process.HasExited) { throw 'Packaged app exited early.' }
        $handle = [CineMatePackageUI]::Find($process.Id, $title)
        if ($handle -ne [IntPtr]::Zero) { return [System.Windows.Automation.AutomationElement]::FromHandle($handle) }
        Start-Sleep -Milliseconds 100
    } while ([DateTime]::UtcNow -lt $deadline)
    throw 'Packaged window startup timeout.'
}
function Wait-Playback($player) {
    $deadline = [DateTime]::UtcNow.AddSeconds(10)
    do {
        $position = (Find-Control $player 'Позиция воспроизведения').GetCurrentPattern([System.Windows.Automation.RangeValuePattern]::Pattern).Current
        if ($position.Maximum -ge 7000 -and $position.Value -ge 100) { return [long]$position.Value }
        Start-Sleep -Milliseconds 100
    } while ([DateTime]::UtcNow -lt $deadline)
    throw 'Actual playback did not advance.'
}
function Wait-PlayerClosed {
    $deadline = [DateTime]::UtcNow.AddSeconds(12)
    while ([CineMatePackageUI]::Find($process.Id, 'CineMate Player') -ne [IntPtr]::Zero) {
        if ([DateTime]::UtcNow -ge $deadline) { throw 'Player teardown did not finish.' }
        Start-Sleep -Milliseconds 100
    }
}
try {
    $env:CINEMATE_DATA_DIRECTORY = $data
    $exe = Join-Path $app 'CineMate.exe'
    # Visible window is necessary for the explicitly scoped UI acceptance.
    $process = Start-Process -FilePath $exe -WorkingDirectory $root -WindowStyle Normal -PassThru
    Write-Output 'STAGE packaged-start'
    $main = Wait-Window 'CineMate — личная фильмотека'
    Invoke-Control $main 'Открыть видео'
    $player = Wait-Window 'CineMate Player'
    $null = Wait-Playback $player
    Invoke-Control $player 'Воспроизвести или приостановить'
    Start-Sleep -Milliseconds 350
    if ((Find-Control $player 'PlaybackStatus' -ById).Current.Name -ne 'Пауза') { throw 'Pause was not observed.' }
    $slider = Find-Control $player 'Позиция воспроизведения'
    $range = $slider.GetCurrentPattern([System.Windows.Automation.RangeValuePattern]::Pattern).Current
    $bounds = $slider.Current.BoundingRectangle
    $startX = [int]($bounds.Left + 8 + ($bounds.Width - 16) * $range.Value / $range.Maximum)
    $endX = [int]($bounds.Left + 8 + ($bounds.Width - 16) * 3000 / $range.Maximum)
    $y = [int]($bounds.Top + $bounds.Height/2)
    $null = [CineMatePackageUI]::SetCursorPos($startX,$y)
    [CineMatePackageUI]::mouse_event(2,0,0,0,[UIntPtr]::Zero)
    Start-Sleep -Milliseconds 100
    $null = [CineMatePackageUI]::SetCursorPos($endX,$y)
    Start-Sleep -Milliseconds 100
    [CineMatePackageUI]::mouse_event(4,0,0,0,[UIntPtr]::Zero)
    Start-Sleep -Milliseconds 300
    Invoke-Control $player 'Закрыть плеер'
    Wait-PlayerClosed
    $saved = @(Get-Content -LiteralPath $library -Raw | ConvertFrom-Json)[0]
    if ($saved.Volume -ne 0 -or -not $saved.IsMuted) { throw 'Saved audio preferences were reset.' }
    if ($saved.ResumePositionMs -lt 2300 -or $saved.ResumePositionMs -gt 3700) { throw 'Seek/close did not save the requested position.' }
    $savedPosition = $saved.ResumePositionMs
    Write-Output "STAGE saved-position-ms=$savedPosition"
    $null = $process.CloseMainWindow()
    if (-not $process.WaitForExit(12000)) { throw 'Packaged app did not close cleanly.' }
    $process = Start-Process -FilePath $exe -WorkingDirectory $root -WindowStyle Normal -PassThru
    Write-Output 'STAGE packaged-restart'
    $main = Wait-Window 'CineMate — личная фильмотека'
    $texts = $main.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
    $restoredCard = $false
    foreach ($text in $texts) { if ($text.Current.Name -match '^Продолжить с 0:0[23]$') { $restoredCard = $true } }
    if (-not $restoredCard) { throw 'Resume card was not restored after process restart.' }
    Invoke-Control $main 'Открыть видео'
    $player = Wait-Window 'CineMate Player'
    $resumed = Wait-Playback $player
    if ($resumed -isnot [long] -or $resumed -lt $savedPosition - 500 -or $resumed -gt $savedPosition + 1500) { throw 'Actual playback did not resume near the saved position.' }
    Write-Output "STAGE resumed-position-ms=$resumed"
    Invoke-Control $player 'Закрыть плеер'
    Wait-PlayerClosed
    $null = $process.CloseMainWindow()
    if (-not $process.WaitForExit(12000)) { throw 'Restarted packaged app did not close cleanly.' }
    $receipt = @{ result='PASS'; zipSha256=(Get-FileHash $ZipPath).Hash; extractedFileChecks=@($manifest.files).Count; savedPositionMs=$savedPosition; resumedPositionMs=$resumed; isolatedDirectory=$root; humanMovie=$false; physicalAudio=$false }
    [IO.File]::WriteAllText((Join-Path $root 'acceptance.json'), ($receipt | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
    $receipt | ConvertTo-Json
} finally {
    $env:CINEMATE_DATA_DIRECTORY = $previousData
    if ($process -and -not $process.HasExited) {
        $null = $process.CloseMainWindow()
        if (-not $process.WaitForExit(4000)) { $process.Kill(); throw 'Forced cleanup: UI acceptance did not finish cleanly.' }
    }
}
