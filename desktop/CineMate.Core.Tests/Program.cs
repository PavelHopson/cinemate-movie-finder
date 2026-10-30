using CineMate.Core;

var runner = new TestRunner();
runner.Run("accepts a local supported file", () =>
{
    using var fixture = new TemporaryDirectory();
    var file = Path.Combine(fixture.Path, "movie.mkv");
    File.WriteAllBytes(file, [1, 2, 3]);
    var result = LocalMediaPolicy.Validate(file);
    Assert.True(result.IsAllowed);
    Assert.Equal(Path.GetFullPath(file), result.FullPath);
});

runner.Run("rejects relative, remote and unsupported paths", () =>
{
    Assert.Equal("not-local", LocalMediaPolicy.Validate("movie.mp4").ErrorCode);
    Assert.Equal("not-local", LocalMediaPolicy.Validate("https://example.test/movie.mp4").ErrorCode);
    Assert.Equal("network-path", LocalMediaPolicy.Validate("\\\\server\\share\\movie.mkv", requireExistingFile: false).ErrorCode);

    using var fixture = new TemporaryDirectory();
    var file = Path.Combine(fixture.Path, "movie.exe");
    File.WriteAllBytes(file, [1]);
    Assert.Equal("unsupported-extension", LocalMediaPolicy.Validate(file).ErrorCode);
});

runner.Run("distinguishes missing and empty files", () =>
{
    using var fixture = new TemporaryDirectory();
    var missing = Path.Combine(fixture.Path, "missing.mp4");
    Assert.Equal("missing", LocalMediaPolicy.Validate(missing).ErrorCode);

    var empty = Path.Combine(fixture.Path, "empty.mp4");
    File.WriteAllBytes(empty, []);
    Assert.Equal("empty-file", LocalMediaPolicy.Validate(empty).ErrorCode);
});

runner.Run("persists playback state and file association", () =>
{
    using var fixture = new TemporaryDirectory();
    var video = Path.Combine(fixture.Path, "Кино.mkv");
    File.WriteAllBytes(video, [1, 2, 3, 4]);
    var item = new LibraryItem
    {
        ResumePositionMs = 42_000,
        DurationMs = 120_000,
        Volume = 37,
        IsMuted = true
    };
    item.UpdateFile(video);

    var store = new LibraryStore(Path.Combine(fixture.Path, "data"));
    store.Save([item]);
    var loaded = store.Load().Single();

    Assert.Equal(item.Id, loaded.Id);
    Assert.Equal(Path.GetFullPath(video), loaded.FilePath);
    Assert.Equal(42_000L, loaded.ResumePositionMs);
    Assert.Equal(120_000L, loaded.DurationMs);
    Assert.Equal(37, loaded.Volume);
    Assert.True(loaded.IsMuted);
});

runner.Run("backs up corrupt library data without deleting it", () =>
{
    using var fixture = new TemporaryDirectory();
    var dataDirectory = Path.Combine(fixture.Path, "data");
    Directory.CreateDirectory(dataDirectory);
    File.WriteAllText(Path.Combine(dataDirectory, "library.json"), "{private-broken-json");

    var store = new LibraryStore(dataDirectory);
    Assert.Equal(0, store.Load().Count);
    Assert.True(store.LastRecoveryMessage is not null);
    Assert.Equal(1, Directory.GetFiles(dataDirectory, "library.corrupt-*.json").Length);
    Assert.True(File.Exists(store.LibraryPath));
});

runner.Run("rejects a relative or network data directory", () =>
{
    Assert.Throws<ArgumentException>(() => new LibraryStore("relative-data"));
    Assert.Throws<ArgumentException>(() => new LibraryStore("\\\\server\\share\\cinemate"));
});

runner.Run("does not probe a network path while rendering availability", () =>
{
    var item = new LibraryItem { FilePath = "\\\\untrusted-host\\share\\movie.mkv" };
    Assert.Equal(false, item.IsAvailable);
    Assert.Equal("Файл не найден", item.AvailabilityText);
});

return runner.Complete();

internal sealed class TestRunner
{
    private int _passed;
    private int _failed;

    public void Run(string name, Action test)
    {
        try
        {
            test();
            _passed++;
            Console.WriteLine($"PASS {name}");
        }
        catch (Exception exception)
        {
            _failed++;
            Console.Error.WriteLine($"FAIL {name}: {exception.Message}");
        }
    }

    public int Complete()
    {
        Console.WriteLine($"RESULT passed={_passed} failed={_failed}");
        return _failed == 0 ? 0 : 1;
    }
}

internal static class Assert
{
    public static void True(bool value)
    {
        if (!value) throw new InvalidOperationException("Expected true.");
    }

    public static void Equal<T>(T expected, T actual)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
        {
            throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
        }
    }

    public static void Throws<TException>(Action action) where TException : Exception
    {
        try
        {
            action();
        }
        catch (TException)
        {
            return;
        }
        throw new InvalidOperationException($"Expected {typeof(TException).Name}.");
    }
}

internal sealed class TemporaryDirectory : IDisposable
{
    public TemporaryDirectory()
    {
        Path = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "cinemate-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path);
    }

    public string Path { get; }

    public void Dispose()
    {
        if (Directory.Exists(Path))
        {
            Directory.Delete(Path, recursive: true);
        }
    }
}
