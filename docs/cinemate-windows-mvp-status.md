# CineMate Windows MVP status

Updated: 2026-10-09. Owner: CineMate. Scope: local development only.

## IDEA-004 / Accepted-package provenance audit — 2026-10-09

Documentation-only, read-only package/source audit. Checkout remains dirty
`main` at `9699d4b94308d072e18a01c44a3b15543c1a9dd1`; no application edits,
build, installer, new ZIP, tests rerun, commit, push, release or deployment.
Task Manager and Eclipse Chat are outside this audit. Applied the installed
`analyzing-sbom-for-supply-chain-vulnerabilities` playbook to identity, component
coverage and provenance; no new scanner/dependency installation.

### Exact artifact and checks

- Accepted ZIP:
  `desktop/TestArtifacts/package-ebc7b820a95945b69e3a8117749e28c1/CineMate-local-win-x64.zip`.
  SHA-256 `86105BF4BF61619B2CFDDE70D7DB20B99E5574EF02B1FE9AFA01C4A2ECCFA973`;
  123804527 bytes, unchanged. The earlier accepted ZIP also remains untouched.
- Streamed all ZIP entries without extraction/execution: 898 listed files
  passed exact length and SHA-256 checks; the only additional entry is
  `package-manifest.json`, with no duplicate or unlisted payload.
- Recomputed cached package identities against the accepted manifest:
  VideoLAN signed-archive SHA-512 and both Microsoft runtime archive SHA-256
  values match. Prior signature verification remains the recorded acceptance
  evidence; certificate-chain verification was not repeated in this audit.
- Compared actual ZIP hashes with entries of those same nupkgs: managed wrappers
  1 + 1 files, VideoLAN native/resources 422 files, .NETCore 179 files and
  WindowsDesktop 280 files match. Initial one-package-per-name mapping rejected
  `Microsoft.VisualBasic.dll`; a union of both runtime packs resolves this and
  the other overlapping names `System.Drawing.dll` / `WindowsBase.dll` to exact
  WindowsDesktop bytes. No unmatched non-application payload remains.
- No new runtime/functional acceptance claim: the five teardown and seven Core
  checks and the 2987 -> 2987 ms UI receipt below remain previous evidence.

### Components, exact identity and source correspondence

SHA values in this table are SHA-256 of the stated DLL/archive, not Git commit
IDs. Full per-file hashes remain inside the accepted ZIP's manifest; it is a
file inventory, not a complete component-level CycloneDX/SPDX SBOM.

| Component | Actual version / representative SHA-256 | Primary source / correspondence | License / status |
| --- | --- | --- | --- |
| LibVLCSharp | NuGet 3.10.1; DLL `87012C33C4E49FB0A642697992BCAB02A1130A117F174D3AB55019FF28E54E00` | Signed nuspec pins [4896d0e06d19ac40b46802cf7dc167d432f3fd63](https://code.videolan.org/videolan/LibVLCSharp/-/commit/4896d0e06d19ac40b46802cf7dc167d432f3fd63); commit and LICENSE fetched through official GitLab API | LGPL-2.1-or-later; identity/source revision confirmed, corresponding-source delivery not arranged |
| LibVLCSharp.WPF | NuGet 3.10.1; DLL `08EA812AAB116CE457B4113BB570C97342CE5F6ECB59DDF433EE5532FDD0D39D` | Same pinned upstream commit; ZIP DLL matches `lib/net6.0-windows7.0` archive entry | LGPL-2.1-or-later; same source-delivery gate |
| VideoLAN.LibVLC.Windows | NuGet 3.0.24; libvlc.dll `C0B1BEDBC8E11267B39111733920A6AF73D08791E333E4F8902EAFFE4DAF6DB9`; libvlccore.dll `C089F281AFFE1E85C61EDD5996C2B496191F82FA5CDC7EF709B0C09BF754CDBE` | PE version 3.0.24, embedded build ID `3.0.24-rc1-0-g6de05adcba`; official API resolves to [6de05adcbaf2e8b85fe86aad4169393098628119](https://code.videolan.org/videolan/vlc/-/commit/6de05adcbaf2e8b85fe86aad4169393098628119), whose configure.ac declares 3.0.24 | Nuspec LGPL-2.1-or-later; binary identity and declared VLC source ID confirmed, exact recipe/contrib/patch/toolchain mapping OPEN |
| Native plugins / contrib / Lua resources | Within the 422-file VideoLAN subtree: 323 DLLs (2 core + 321 plugin), 2 JARs, 35 LUAC, 1 LUA, 1 SOFA, 2 LIB and 58 other resources | All bytes match native NuGet; [libvlc-nuget](https://code.videolan.org/videolan/libvlc-nuget) is the declared project, not proof of the exact build. Official tag search for 3.0.24 returned an empty list | Per-component versions/licenses and static linkage are not supplied by nuspec; package-wide LGPL is not a full inventory |
| Microsoft.NETCore.App.Runtime.win-x64 | 8.0.22; coreclr.dll `36E658CED657F4B29526D0ABF8A2B8E208C20A2730512F25B80D3EEC7955920F` | Nuspec, versions.txt and native PE metadata agree on [a2266c728f63a494ccb6786d794da2df135030be](https://github.com/dotnet/runtime/commit/a2266c728f63a494ccb6786d794da2df135030be) | MIT plus supplied THIRD-PARTY-NOTICES; source revision confirmed, current security/support NOT cleared |
| Microsoft.WindowsDesktop.App.Runtime.win-x64 | 8.0.22; wpfgfx_cor3.dll `1CCB4943EF0D472D70E1CB4738F89FB457010E12FA82379DAF2DC64CF59D6E9B` | Pack nuspec/versions.txt declare windowsdesktop `4519b9f0e25cae3c6d06cbd80cae9d6bd5fb90f7` (public endpoint timed out); wpfgfx metadata points to [WPF 925e025a1ad14f0b6f094e5b2d5cc9f62ada294c](https://github.com/dotnet/wpf/commit/925e025a1ad14f0b6f094e5b2d5cc9f62ada294c), confirmed by official API | MIT; WPF source-specific notices are not fully retained, see below |
| PresentationNative_cor3.dll | In the signed WindowsDesktop 8.0.22 pack; PE product `8.0.0-rtm.25515.4`; SHA `75FC0D383EA009EA9453A4589FA8D88D149ABCAC371BB5EB983D6ECE8F1243EB` | PE declares `3579c8c9e7130f77ecc417f9cbcfbf728b1cb10c`; public dotnet/wpf commit API returned 404 | Signed binary origin confirmed; exact public source-repository/revision mapping UNVERIFIED, not treated as tampering |
| HRTF resource | `dodeca_and_7channel_3DSL_HRTF.sofa`; SHA `05CA927052CF83663B29546B06998B03EA7FBCD288F7C99E7AF8B215AC77EC4E` | Embedded metadata names 3D Sound Labs, creation 2017-12-15; bytes match accepted native NuGet | Embedded copyright and LGPL-2.1-or-later text confirmed; original dataset/build materials not independently tied to this binary |

Additional archive identities (same cached signed nupkgs used by accepted build):

| NuGet archive | SHA-256 |
| --- | --- |
| LibVLCSharp 3.10.1 | `B02486D628519115879DB93EF6FE0B2D46C62095F6F72114E5DFA8DF9A77F332` |
| LibVLCSharp.WPF 3.10.1 | `A812EF38133DEE79C5113004ED6B6335FED0984FE94E96BEF887144012C56A5C` |
| VideoLAN.LibVLC.Windows 3.0.24 | `3DA3F37EE2B2B10E5C788D830A3B513658C36521EA1B0F966ED86EB69F41EF3C` |
| Microsoft.NETCore.App.Runtime.win-x64 8.0.22 | `7F1A0BF26CE4DAF3EF5C4700B38AB1BE21E489C9BC365457994D0B367F197419` |
| Microsoft.WindowsDesktop.App.Runtime.win-x64 8.0.22 | `0025FE5BD28C5DE0860BCFD7AD387E2B2267434A9FD05DF054152F2B02500E1A` |

### Confirmed notices versus missing materials

- ZIP retains seven files under `licenses/`: full LGPL-2.1 text, three VideoLAN
  nuspecs, Core runtime MIT license + THIRD-PARTY-NOTICES, Desktop runtime MIT
  license. Root NOTICE explicitly says local-only and source gate OPEN.
  LGPL text SHA-256 is
  `DC626520DCD53A22F727AF3EE42C770E56C97A64FE3ADB063799D8AB032FE551`.
- The official [WPF THIRD-PARTY-NOTICES at the wpfgfx revision](https://raw.githubusercontent.com/dotnet/wpf/925e025a1ad14f0b6f094e5b2d5cc9f62ada294c/THIRD-PARTY-NOTICES.TXT)
  was fetched (HTTP 200, 2703 characters). It contains Zlib 1.2.11 / 1995-2017
  and Json.NET notices. Whitespace-normalized comparison finds the Json.NET
  license body in shipped Core notices, but not the WPF-specific Zlib body;
  Core's Zlib notice is 1.3.1 / 1995-2022. No dedicated WPF notice file is in the
  ZIP or Desktop nupkg. Do not assume Core notices cover the whole Desktop pack;
  determine the included native component mapping and retain relevant notices
  in a future package. Existing ZIP remains immutable.
- Both libbluray JARs have no LICENSE/COPYING/NOTICE entries. Their names identify
  1.4.1; META-INF only reports Ant 1.10.13 and Java 17.0.20 Debian, not an exact
  libbluray source revision. Official [libbluray 1.4.1](https://code.videolan.org/videolan/libbluray/-/tree/1.4.1)
  resolves through its API to `7d94f2660af5bfc16015291a03539329135c18f1`, with
  LGPL-2.1 COPYING, but binary-to-source/patch correspondence remains unproved.
  JAR SHA-256: awt `32ABCA728318F04108DC057C747D75451E7E3138EA2EFA4917F17FBC28D2263E`;
  main `D5E77DC1F606D16E2A0D65FE7DF694EF51B5CAF7769469A28FB0B1026D66F75B`.
- FFmpeg-related plugin SHA-256
  `F8AF2239F1A1FA99E2B808AF852E87A72447C51134A96BFE4EF538629702744E`;
  embedded strings include `Lavc62.28.102` / `Lavf62.12.102`. These are trace
  leads, not a confirmed FFmpeg release/commit, configuration or license list.
  The same limitation applies to GnuTLS, FreeType and other contrib-linked
  plugins. Do not infer their versions/licenses from filenames or VLC's version.
- Exact VideoLAN source IDs above were verified through public GitLab API;
  some browser fetches failed. No source tarballs or large binaries downloaded.
  Existing generic release-tag links in the immutable NOTICE are references,
  not an exact-source offer or reproducible-build proof.

### Public-release gates / result

- Medium OPEN, now narrowed: binary provenance is established to accepted signed
  packages, and declared managed/VLC/Core/WPF source IDs were recovered; complete
  native contrib/source/license correspondence is still missing. Obtain exact
  build recipe, patches, dependency revisions, static-link options and component
  notices/sources for all shipped plugins, scripts, JARs and data resources.
- Medium OPEN: source-specific WPF notice coverage and PresentationNative source
  mapping need closure before distribution. Current package metadata alone does
  not close these gaps. No project-license change or legal-clearance claim.
- Arrange and verify the applicable corresponding-source delivery and compatible
  shared-library replacement/debugging route; LGPL-2.1 sections 4 and 6 in the
  retained license are the primary text. A link to a repository is not delivery
  of the exact materials used to build the shipped binaries.
- Prior runtime security/support and OS/process/egress isolation gates remain
  OPEN. No full native advisory scan, complete SBOM or clean VM/signing test was
  performed; syft/grype were not found on PATH and were not installed.
- Result: evidence is stronger, but `publicRedistributionApproved:false` and
  `nativeComponentLicenseAuditComplete:false` remain correct. This audit does
  NOT authorize public release. Only this existing status document changed.

## IDEA-004 / Teardown failure regression — 2026-10-09

Local correction only, on the existing dirty `main`, HEAD
`9699d4b94308d072e18a01c44a3b15543c1a9dd1`. No branch, commit, push,
release, deployment or Eclipse Chat changes. Existing unrelated changes and
the previously accepted ZIP are preserved.

### Cause and change

- A teardown exception left `_isClosing` true and the old `_shutdownComplete`
  false, so subsequent Close requests were cancelled indefinitely. The failure
  feedback therefore suggested an action that the window could not complete.
- Separate permission to close from cleanup success (`_allowClose`). On failure,
  show a generic error, disable playback and permit the next explicit Close.
  Never retry uncertain native Stop/Dispose, resume playback or claim cleanup
  succeeded. Keep the closing guard against late dispatcher callbacks.
- A synchronously completed shutdown task also caused Close to re-enter WPF's
  original Closing event. Queue the final successful Close on the dispatcher.
- Add an internal, trusted in-process shutdown scheduling seam and a
  dependency-free `CineMate.Desktop.Tests` executable in the solution. It uses
  the real PlayerWindow/XAML/Closing handler, not a duplicate state machine.
  The seam is not selectable through environment variables, media or IPC.
- Changed surfaces: PlayerWindow, desktop project friend-assembly declaration,
  solution, new desktop regression project/lockfile and this existing status.
  No runtime package version or dependency was added or changed.

### Evidence

- Red baseline with the corrected nonvisual WPF harness: 1 pass, 2 failures
  (exception-close and synchronous-success-close), exit 1. After correction:
  5/5 pass, covering faulted/synchronously thrown/delayed exceptions, duplicate
  Close during in-flight teardown, and synchronously completed success. Each
  failure case asserts a single shutdown attempt, visible generic feedback,
  disabled playback, no exception-detail disclosure and one explicit close.
- Solution locked restore from the official NuGet source passed for all five
  projects. Release build: zero warnings/errors. Core runner: 7/7.
- Real LibVLC smoke on the existing synthetic 8021 ms MKV: playback, seek,
  pause/resume and two audio / one subtitle track checks passed.
- Fresh official NuGet advisory query: no known vulnerable direct/transitive
  NuGet packages in all five projects. This does not clear native contrib or
  the self-contained runtime. No CycloneDX/SPDX, syft/grype or native NVD scan.
- Fresh package: mandatory VideoLAN repository signatures, Microsoft runtime
  author/repository signatures, signed-vendor-byte comparisons, notices and
  local-only manifest checks passed. Package contracts: 8/8; inventory 898 files.
- Actual packaged UI run exited 0: play/pause, timeline seek, player close,
  process restart, restored card and playback position 2987 ms, preserved mute
  and volume 0, then clean player/process close. Isolated synthetic media/data;
  no human movie, physical audio or file-picker acceptance claim.
- Receipt:
  `C:/Users/garaa/AppData/Local/Temp/CineMate-acceptance-d4ad5f6d616d4483ae437c7d6b3ab11e/acceptance.json`.
- New local artifact (123804527 bytes):
  `desktop/TestArtifacts/package-ebc7b820a95945b69e3a8117749e28c1/CineMate-local-win-x64.zip`.
- SHA-256: `86105BF4BF61619B2CFDDE70D7DB20B99E5574EF02B1FE9AFA01C4A2ECCFA973`.
- Old accepted ZIP remains at its original path/hash `9A1ED6A9...08C9A81`;
  web lockfile remains `DE851A8E...3D552`. Focused source whitespace and narrow
  credential/exception-text pattern checks passed; not a full secret scan.

### Reproduce and remaining limits

From `E:/projects/cinemate-movie-finder/desktop`, stop on any failed command:

```powershell
dotnet restore CineMate.Desktop.sln --locked-mode --source https://api.nuget.org/v3/index.json
dotnet build CineMate.Desktop.sln -c Release --no-restore -m:1
dotnet run --project CineMate.Desktop.Tests -c Release --no-build
dotnet run --project CineMate.Core.Tests -c Release --no-build
```

Low window-close defect is corrected and regression-tested locally. Injected
exceptions exercise the actual handler, not a deliberate native crash or hang.
An indefinitely blocked native call is not addressed by this change; there is
no process isolation, timeout kill or proof that failed native cleanup released
resources. Restart CineMate after the failure. All existing Medium native
license/source, runtime security and OS/process/egress release gates below remain
open. No public redistribution, signed installer, clean VM or human-film/audio
clearance is implied.

## IDEA-004 / Local packaging acceptance — 2026-10-08

Existing dirty `main`, HEAD `9699d4b`, preserved. No branch, commit, push,
deployment, installer or user movie upload. Only desktop and existing docs
changed. Web lockfile SHA-256 remained
`DE851A8E09D7FDB395B70CB1227E2B696BAB479BF29D07848AAD934FBF53D552`.

### Changes

- Desktop-only SDK 8.0.416 / runtime 8.0.22 pins and four NuGet lockfiles.
- `desktop/packaging/package-local.ps1`: locked restore, fresh non-single-file
  x64 publish, LGPL text / package metadata / Microsoft runtime license-notices,
  local-only NOTICE, binary inventory and stable-order/timestamp ZIP. VideoLAN
  signatures and published vendor bytes are checked against signed nupkgs.
- `package-validation.psm1` and eight checks prevent altered/unlisted payload,
  duplicate paths, traversal, invalid hashes and a public-redistribution flag.
- `test-package-ui.ps1`: actual packaged WPF + LibVLC, isolated synthetic
  library/media, pause, mouse timeline seek, process restart, resume clock,
  mute/volume persistence and clean shutdown. The import file picker was not
  re-tested; the synthetic library is seeded explicitly in isolated test data.
- Packaged acceptance reproduced failure to close the active player. Native
  stop/dispose had run synchronously in WPF Closing before detaching the view.
  It now detaches the view, finishes native teardown on a worker, then closes;
  queued dispatcher actions also recheck closing before touching disposed state.
- XAML initialization reset saved volume to 80. Capture the persisted volume
  before InitializeComponent; UI regression keeps volume 0 and mute true.

### Evidence

- Solution Release build: zero warnings/errors; core runner 7/7.
- Real LibVLC smoke: generated 8021 ms MKV, two audio / one subtitle tracks,
  seekable; play/pause/resume/seek and track checks passed.
- Fresh official NuGet advisory check: no known vulnerable direct/transitive
  NuGet packages in all four projects. This is not a native contrib/codec or
  .NET runtime advisory clearance. No syft/grype/NVD native scan was run.
- Package contracts: 8/8, including actual 898-file inventory.
- Packaged UI acceptance exited 0: saved 2993 ms, resumed 2993 ms, both process
  closures clean. Old failed runs are not acceptance evidence.
- Acceptance receipt:
  `C:/Users/garaa/AppData/Local/Temp/CineMate-acceptance-279baf4982a34628b8cb148b0f0f09cb/acceptance.json`.
- Accepted local artifact (123804241 bytes):
  `desktop/TestArtifacts/package-c1d2093f6638450da944e9c211a091e6/CineMate-local-win-x64.zip`.
- SHA-256: `9A1ED6A991466F27D54CDE26B48CE67AADE1EBAAC68FBD576388CDFBF08C9A81`.
- Two independent packages of the final fixed runtime have the identical ZIP
  hash above. Second output: `desktop/TestArtifacts/package-609e3f85c11a4d8c89147b060d3a7c10/CineMate-local-win-x64.zip`.
- All three VideoLAN repository signatures and both Microsoft runtime
  author/repository signatures verified. Script parsing and a narrow secret-pattern
  check passed; these are not a full secret scanner or native CVE assessment.

### Reproduce (Windows)

From `E:/projects/cinemate-movie-finder/desktop`:

```powershell
dotnet build CineMate.Desktop.sln -c Release --no-restore -m:1
dotnet run --project CineMate.Core.Tests -c Release --no-build
pwsh -NoProfile -File packaging/package-local.ps1
```

Use the returned package/ZIP paths, stop if any preceding command fails:

```powershell
pwsh -NoProfile -File packaging/test-package-contract.ps1 -PackageDirectory '<returned stage directory>'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File packaging/test-package-ui.ps1 -ZipPath '<returned ZIP>'
```

PowerShell 7.4+ is required for packaging, Windows PowerShell 5.1 for UI Automation.
The known synthetic MKV in ignored TestArtifacts is required for UI acceptance;
the harness fails if absent/changed. It never uses the default user library.

### Security / release gates

- Medium, open: exact native build/contrib source and component license inventory
  are absent from the native nuspec. NOTICE references are not a source offer.
  Full LGPL/native corresponding-source review is NOT closed by this local ZIP.
- Medium, open: parsing native media is not OS/process/egress sandboxed; no claim
  that `--no-metadata-network-access` disables all native network paths.
- Medium, open: self-contained .NET 8.0.22 must be re-evaluated/patched against
  current support/security before a release. The pin reproduces the local MVP,
  not a claim that this is the current secure runtime.
- No new Critical/High identified in this bounded diff; no blanket clearance.
  Signatures/hashes identify binary provenance, not absence of vulnerabilities.
- Low, historical (A-00 review; locally corrected above on 2026-10-09): if native teardown
  throws in `PlayerWindow_Closing`, catch asks the user to close the app, but
  `_isClosing` remains true and `_shutdownComplete` false. Subsequent Close
  requests for this window are cancelled, so the suggested recovery may fail.
  Next stage: exercise injected teardown failure and define a safe exit/recovery
  path. Normal teardown remains covered by the successful packaged UI run;
  no code fix or repackaging was included in that original review note.
- No long human movie, physical audio, clean Windows VM, installer/signing or
  auto-update test. Web/npm findings from the earlier record remain separate.
- Minimum next release step: exact native source/license closure and supported
  runtime review, then clean-user Windows VM acceptance before signed distribution.

## Goal

Deliver a local Windows first version with a personal movie library and CineMate-owned playback UI while preserving the existing Vite/OMDb catalog.

## Implemented locally

- WPF shell with empty-library, library, missing-file and player-error states.
- Explicit local file picker; no background scan and no upload.
- Local JSON library with atomic replacement and corrupt-data backup.
- Resume position, duration, volume, mute and viewed state.
- Embedded LibVLC playback with play/pause, ±10-second seek, timeline, volume/mute, fullscreen, audio-track and subtitle-track selectors.
- Keyboard: Space, Left/Right, M, F and Escape from fullscreen.
- A dependency-free core regression runner and a real LibVLC playback smoke utility.

## Verification record

Checks run in the dirty local `main` checkout on 2026-10-06. They do not imply publication.

- `npm run build`: passed, Vite transformed 10 modules.
- `dotnet build desktop/CineMate.Desktop.sln -c Release --no-restore -m:1`: passed with 0 warnings and 0 errors.
- self-contained `win-x64` publish: passed; local executable is under `desktop/CineMate.Desktop/bin/Release/net8.0-windows/win-x64/publish/CineMate.exe`.
- core regression runner: 7/7 passed, including local path policy, missing/empty/unsupported files, corrupt-library backup, persistence and no UNC availability probe.
- real LibVLC smoke on a generated eight-second MKV: playback started, seekable, two audio tracks and one embedded Cyrillic subtitle track detected; pause/resume, seek, volume/mute and track selection passed.
- corrupt non-empty `.mkv`: no playable streams detected; the app presents a recoverable error state.
- Windows UI Automation against the published executable: pause/resume, seek, volume, mute, second audio track, Russian subtitles and fullscreen passed.
- real app restart after the UI run: the library card restored the saved position (`Продолжить с 0:03`).
- visual screenshots inspected for empty library, populated library, active player and player error state at 1120x720 / 1180x760; no horizontal clipping was observed. Player controls use a wrapping layout for narrower windows.
- NuGet advisory query: no known vulnerable direct or transitive packages in all four desktop projects.
- npm advisory query: 10 existing development-tool findings (9 High, 1 Moderate) in the pre-existing Vite/gh-pages tree. This slice added no npm dependency and did not rewrite the user's untracked lockfile. Vite's esbuild fix requires a breaking major upgrade; the other lockfile fixes must be handled as a separate web-toolchain update.

## Out of scope for this slice

- distribution, installer, code signing, auto-update, commit, push, PR or deploy;
- server streaming, movie downloads or automatic filesystem indexing;
- AI recommendations, Ultron control and Erida review workflows;
- a separate web player or replacement of the existing web catalog.

## Remaining release blockers

- local evaluation ZIP exists, but no installer, code signing, auto-update or approved public package;
- LGPL notices and corresponding-source/relinking information must be included before redistribution;
- no human-owned long movie was used; runtime coverage used a generated local MKV;
- the existing npm development-tool advisories remain unresolved and should be remediated without overwriting the current untracked lockfile.
