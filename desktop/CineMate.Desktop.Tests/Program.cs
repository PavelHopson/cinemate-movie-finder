using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using System.Windows.Media;
using CineMate.Core;
using CineMate.Desktop;

internal static class Program
{
    private static int _failed;
    private static int _passed;

    [STAThread]
    private static int Main()
    {
        // Nonvisual resource fixture for the real PlayerWindow/XAML/Closing
        // handler. No App StartupUri, user library, Loaded or native media.
        var app = new Application();
        foreach (var key in new[] { "VoidBrush", "SurfaceBrush", "SurfaceRaisedBrush", "BorderBrush", "TextBrush", "MutedTextBrush", "AccentBrush", "DangerBrush" })
            app.Resources[key] = Brushes.Black;
        app.Resources["PrimaryButton"] = new Style(typeof(Button));
        app.Resources["SecondaryButton"] = new Style(typeof(Button));
        app.ShutdownMode = ShutdownMode.OnExplicitShutdown;
        app.Dispatcher.InvokeAsync(async () =>
        {
            await Check("native exception permits explicit close without retry", FailureAllowsClose);
            await Check("synchronous native exception permits close without retry", () => FailureAllowsClose("sync"));
            await Check("delayed native exception permits close without retry", () => FailureAllowsClose("delayed"));
            await Check("queued close does not repeat in-flight teardown", InFlightClose);
            await Check("successful teardown closes exactly once", SuccessCloses);
            Console.WriteLine($"RESULT passed={_passed} failed={_failed}");
            app.Shutdown();
        });
        app.Run();
        return _failed == 0 ? 0 : 1;
    }

    private static Task FailureAllowsClose() => FailureAllowsClose("faulted");

    private static async Task FailureAllowsClose(string failureMode)
    {
        var calls = 0;
        var window = new PlayerWindow(new LibraryItem(), _ => { }, _ =>
        {
            calls++;
            if (failureMode == "sync") throw new InvalidOperationException("SYNTHETIC_PRIVATE_TEARDOWN_DETAIL");
            if (failureMode == "delayed") return Task.Run(async () =>
            {
                await Task.Delay(40);
                throw new InvalidOperationException("SYNTHETIC_PRIVATE_TEARDOWN_DETAIL");
            });
            return Task.FromException(new InvalidOperationException("SYNTHETIC_PRIVATE_TEARDOWN_DETAIL"));
        });
        var closed = 0;
        window.Closed += (_, _) => closed++;
        window.Close();
        await WaitUntil(() => ((TextBlock)window.FindName("PlaybackStatus")).Text.Contains("заверш", StringComparison.OrdinalIgnoreCase));
        var status = ((TextBlock)window.FindName("PlaybackStatus")).Text;
        Require(status.Contains("заверш", StringComparison.OrdinalIgnoreCase), "missing failure feedback");
        Require(!status.Contains("SYNTHETIC_PRIVATE", StringComparison.Ordinal), "private exception leaked into UI");
        Require(!((Button)window.FindName("PlayPauseButton")).IsEnabled, "playback remains enabled after teardown failure");
        Require(closed == 0, "failure should remain visible until explicit close");
        window.Close();
        await WaitUntil(() => closed == 1);
        window.Close();
        Require(calls == 1, "native teardown was retried after failure");
        Require(closed == 1, "duplicate window close");
    }

    private static async Task InFlightClose()
    {
        var calls = 0;
        var pending = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var window = new PlayerWindow(new LibraryItem(), _ => { }, _ => { calls++; return pending.Task; });
        var closed = 0;
        window.Closed += (_, _) => closed++;
        window.Close();
        window.Close();
        Require(calls == 1 && closed == 0, "in-flight native teardown duplicated or bypassed");
        pending.SetResult();
        await WaitUntil(() => closed == 1);
        Require(calls == 1, "native teardown duplicated after completion");
    }

    private static async Task SuccessCloses()
    {
        var calls = 0;
        var window = new PlayerWindow(new LibraryItem(), _ => { }, action =>
        {
            calls++;
            action();
            return Task.CompletedTask;
        });
        var closed = 0;
        window.Closed += (_, _) => closed++;
        window.Close();
        await WaitUntil(() => closed == 1);
        Require(calls == 1, "successful native teardown duplicated");
    }

    private static async Task WaitUntil(Func<bool> condition)
    {
        var deadline = DateTime.UtcNow.AddSeconds(2);
        while (!condition())
        {
            if (DateTime.UtcNow >= deadline) throw new InvalidOperationException("window close timeout");
            await Task.Delay(20);
        }
    }

    private static async Task Check(string name, Func<Task> test)
    {
        try { await test(); _passed++; Console.WriteLine($"PASS {name}"); }
        catch (Exception) { _failed++; Console.Error.WriteLine($"FAIL {name}"); }
    }

    private static void Require(bool condition, string safeMessage)
    {
        if (!condition) throw new InvalidOperationException(safeMessage);
    }
}
