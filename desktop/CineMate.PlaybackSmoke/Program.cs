using LibVLCSharp.Shared;

if (args.Length < 1)
{
    Console.Error.WriteLine("Usage: CineMate.PlaybackSmoke <local-media-path> [expected-audio-tracks] [expected-subtitle-tracks] [--expect-error]");
    return 2;
}

var path = Path.GetFullPath(args[0]);
var expectError = args.Contains("--expect-error", StringComparer.Ordinal);
var numericArguments = args.Skip(1).Where(value => !value.StartsWith("--", StringComparison.Ordinal)).ToArray();
var expectedAudioTracks = numericArguments.Length > 0 ? int.Parse(numericArguments[0]) : 1;
var expectedSubtitleTracks = numericArguments.Length > 1 ? int.Parse(numericArguments[1]) : 0;
if (!File.Exists(path))
{
    Console.Error.WriteLine("FAIL media file does not exist");
    return 2;
}

Core.Initialize();
using var libVlc = new LibVLC(
    "--vout=dummy",
    "--aout=dummy",
    "--no-video-title-show",
    "--no-metadata-network-access",
    "--quiet");
using var media = new Media(libVlc, new Uri(path));
using var player = new MediaPlayer(libVlc);

var playing = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
var failed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
player.Playing += (_, _) => playing.TrySetResult();
player.EncounteredError += (_, _) => failed.TrySetResult();

if (!player.Play(media))
{
    if (expectError)
    {
        Console.WriteLine("PASS corrupt or unsupported media was rejected before playback");
        return 0;
    }
    Console.Error.WriteLine("FAIL engine rejected media before playback");
    return 1;
}

var first = await Task.WhenAny(playing.Task, failed.Task, Task.Delay(TimeSpan.FromSeconds(12)));
if (first == failed.Task)
{
    if (expectError)
    {
        Console.WriteLine("PASS corrupt or unsupported media produced a playback error");
        return 0;
    }
    Console.Error.WriteLine("FAIL engine reported a playback error");
    return 1;
}
if (first != playing.Task)
{
    Console.Error.WriteLine("FAIL playback did not start before timeout");
    return 1;
}

if (expectError)
{
    var lateFailure = await Task.WhenAny(failed.Task, Task.Delay(TimeSpan.FromSeconds(2)));
    if (lateFailure == failed.Task)
    {
        Console.WriteLine("PASS corrupt or unsupported media produced a playback error");
        return 0;
    }
    var hasPlayableTrack = player.VideoTrackDescription.Any(track => track.Id >= 0) ||
        player.AudioTrackDescription.Any(track => track.Id >= 0);
    if (player.Length <= 0 || !hasPlayableTrack)
    {
        Console.WriteLine("PASS corrupt or unsupported media exposed no playable streams");
        return 0;
    }
    Console.Error.WriteLine($"FAIL invalid media unexpectedly remained in playing state length_ms={player.Length} video_tracks={player.VideoTrackCount} audio_tracks={player.AudioTrackCount}");
    return 1;
}

await Task.Delay(900);
var audioTracks = player.AudioTrackDescription.Count(track => track.Id >= 0);
var subtitleTracks = player.SpuDescription.Count(track => track.Id >= 0);
if (audioTracks < expectedAudioTracks)
{
    Console.Error.WriteLine($"FAIL audio tracks expected>={expectedAudioTracks} actual={audioTracks}");
    return 1;
}
if (subtitleTracks < expectedSubtitleTracks)
{
    Console.Error.WriteLine($"FAIL subtitle tracks expected>={expectedSubtitleTracks} actual={subtitleTracks}");
    return 1;
}

player.Pause();
await Task.Delay(150);
player.Play();
await Task.Delay(150);
player.Volume = 35;
player.Mute = true;
player.Mute = false;

if (player.IsSeekable && player.Length > 1_500)
{
    player.Time = 1_000;
    await Task.Delay(200);
    if (player.Time < 500)
    {
        Console.Error.WriteLine("FAIL seek did not advance playback");
        return 1;
    }
}

var audioOptions = player.AudioTrackDescription.Where(track => track.Id >= 0).ToArray();
if (audioOptions.Length > 1)
{
    if (!player.SetAudioTrack(audioOptions[1].Id))
    {
        Console.Error.WriteLine("FAIL secondary audio track could not be selected");
        return 1;
    }
}

var subtitleOptions = player.SpuDescription.Where(track => track.Id >= 0).ToArray();
if (subtitleOptions.Length > 0 && !player.SetSpu(subtitleOptions[0].Id))
{
    Console.Error.WriteLine("FAIL subtitle track could not be selected");
    return 1;
}

Console.WriteLine($"PASS playback started length_ms={player.Length} audio_tracks={audioTracks} subtitle_tracks={subtitleTracks} seekable={player.IsSeekable}");
player.Stop();
return 0;
