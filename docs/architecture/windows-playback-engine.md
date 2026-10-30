# CineMate Windows playback engine

Status: local MVP decision, 2026-10-06. This is not a release or production claim.

## Decision

The first Windows application uses .NET 8 WPF with LibVLCSharp and the LGPL-only `VideoLAN.LibVLC.Windows` package.

Why this option:

- it embeds video into a CineMate-owned window and exposes play, pause, seek, volume, audio-track and subtitle-track APIs;
- it supports the local formats expected from a personal movie library without writing codecs or demuxers;
- WPF is already available in the installed .NET Windows Desktop runtime and keeps the first shell Windows-specific and small in source code;
- the native engine and .NET bindings have official stable packages and can be pinned for repeatable builds.

## Alternatives considered

| Option | Result |
| --- | --- |
| Windows `MediaPlayerElement` / Media Foundation | Small dependency surface and strong Windows integration, but codec/container support depends on the machine and is less predictable for MKV and varied personal libraries. Kept as a possible future reduced-dependency mode. |
| libmpv | Strong playback API and officially recommended as a backend, but rendering it into the existing web-oriented project requires a more complex native surface/IPC integration for the first Windows slice. |
| MPC-HC JSON/WM_COPYDATA API | Useful external-tool reference, not an embedded engine. It would make CineMate a controller for another player and several playlist commands are explicitly incomplete. |
| Electron/HTML5 video | Reuses more web code but does not reliably cover multiple audio tracks and common MKV codecs in Chromium. It would fail the accepted MVP route. |

## Pinned dependencies

- `LibVLCSharp.WPF` 3.10.1 — LGPL-2.1-or-later.
- `LibVLCSharp` 3.10.1 in the headless smoke utility — LGPL-2.1-or-later.
- `VideoLAN.LibVLC.Windows` 3.0.24 — LGPL-2.1-or-later build.
- The separate `VideoLAN.LibVLC.Windows.GPL` package is intentionally not referenced.

Primary references:

- [LibVLCSharp repository and supported WPF integration](https://github.com/videolan/libvlcsharp)
- [LibVLCSharp WPF airspace guidance](https://github.com/videolan/libvlcsharp/blob/3.x/src/LibVLCSharp.WPF/README.md)
- [mpv client API and embedding guidance](https://mpv.io/manual/stable/)
- [Windows media items, audio tracks and timed metadata](https://learn.microsoft.com/windows/apps/develop/media-playback/media-playback-with-mediasource)
- [MPC-HC API reference at the reviewed commit](https://github.com/clsid2/mpc-hc/blob/a84d0cf38a1866f3518bb819c901300dacff5a9b/src/mpc-hc/MpcApi.h)

## Security and privacy boundary

- only an explicit local file selection is accepted;
- relative paths, URLs and UNC/network paths are rejected in the first version;
- supported file extensions are allowlisted and a file must exist, be readable and non-empty before playback;
- the path is passed directly to LibVLC as a local file URI, never through a shell command;
- LibVLC metadata network access is disabled;
- the movie file is not copied into the app data directory and is never uploaded;
- only library metadata and playback state are stored under `%LOCALAPPDATA%\CineMate\data\library.json`;
- the application requests normal user privileges (`asInvoker`).

Before public redistribution, the packaged app must include the exact LGPL notices and corresponding-source/relinking information required for the pinned native and managed packages. Code signing and an installer are intentionally outside this local MVP.

## Local evaluation packaging — 2026-10-08

Desktop has SDK 8.0.416 / runtime 8.0.22 pins and NuGet lockfiles. The existing
versions are held for local reproducibility, not declared release-security current.
`desktop/packaging/package-local.ps1` retains replaceable managed/native DLLs,
includes LGPL and runtime notices, verifies signed VideoLAN packages and their
published bytes, and emits local-only NOTICE plus hashed binary inventory.
Native x86/ARM64 payloads are disabled for this win-x64 package.

The native nuspec lacks exact build/contrib provenance: full native component
license inventory and equivalent corresponding-source distribution remain gates.
There is no public source offer or license-clearance claim. Detailed evidence
and replay commands: [Windows MVP status](../cinemate-windows-mvp-status.md).
