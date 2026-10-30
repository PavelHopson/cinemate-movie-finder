# CineMate local evaluation package

LOCAL EVALUATION ONLY. Not signed, not approved for public redistribution.

VideoLAN authors provide LibVLCSharp and LibVLC under LGPL-2.1-or-later.
No warranty is provided by those authors. Package metadata and the full LGPL
text are retained in `licenses/`. Microsoft runtime license/notices are also
retained verbatim. CineMate does not modify these third-party binaries.

## Replacement / debugging

This is a non-single-file, non-trimmed, dynamically linked publish. Managed
LibVLCSharp DLLs are beside CineMate.exe; native DLLs and plugins are beneath
libvlc/win-x64. With the app closed, an evaluator can substitute compatible
modified libraries in a COPY of the extracted directory, retaining the ABI
and plugin layout. This local package imposes no signature check on them and
does not prohibit reverse engineering for debugging such modifications.
Do not overwrite your only copy or load untrusted replacement binaries.

## Corresponding source — release gate remains OPEN

Managed package nuspecs identify upstream commit
4896d0e06d19ac40b46802cf7dc167d432f3fd63:
https://code.videolan.org/videolan/LibVLCSharp

Native package VideoLAN.LibVLC.Windows 3.0.24 declares LGPL-2.1-or-later but its
nuspec does not identify an exact build commit or enumerate bundled native
dependencies. Project/build recipe reference:
https://code.videolan.org/videolan/libvlc-nuget
VLC release source reference: https://code.videolan.org/videolan/vlc/-/tree/3.0.24

These references are NOT a complete corresponding-source offer. Before public
distribution obtain and retain the exact native build recipe, contrib sources,
component licenses/notices and corresponding sources, and arrange equivalent
source access alongside binaries. Package-level LGPL metadata alone is not
proof of the licenses of every bundled plugin. The generated file inventory
is evidence of binary contents, not a complete native component SBOM.

Microsoft source references: https://github.com/dotnet/runtime/tree/v8.0.22
and https://github.com/dotnet/wpf/tree/v8.0.22 . The self-contained runtime is
pinned for this evaluation; reassess runtime security/support before release.
