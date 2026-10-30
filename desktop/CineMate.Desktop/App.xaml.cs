using System.IO;
using System.Windows;
using System.Windows.Threading;

namespace CineMate.Desktop;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        DispatcherUnhandledException += OnDispatcherUnhandledException;
        base.OnStartup(e);
    }

    private void OnDispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
    {
        var receipt = WriteCrashReceipt(e.Exception);
        MessageBox.Show(
            $"CineMate не смог открыть окно. Перезапустите приложение. Диагностика сохранена локально: {receipt}",
            "Ошибка CineMate",
            MessageBoxButton.OK,
            MessageBoxImage.Error);
        e.Handled = true;
        Shutdown(1);
    }

    private static string WriteCrashReceipt(Exception exception)
    {
        try
        {
            var configuredDirectory = Environment.GetEnvironmentVariable("CINEMATE_DATA_DIRECTORY");
            var dataDirectory = string.IsNullOrWhiteSpace(configuredDirectory)
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CineMate", "data")
                : Path.GetFullPath(configuredDirectory);
            var logDirectory = Path.Combine(dataDirectory, "logs");
            Directory.CreateDirectory(logDirectory);
            var receipt = Path.Combine(logDirectory, $"crash-{DateTime.UtcNow:yyyyMMddHHmmss}.log");
            File.WriteAllText(receipt, $"utc={DateTime.UtcNow:O}{Environment.NewLine}type={exception.GetType().FullName}{Environment.NewLine}{exception.StackTrace}");
            return receipt;
        }
        catch
        {
            return "запись отчёта недоступна";
        }
    }
}
