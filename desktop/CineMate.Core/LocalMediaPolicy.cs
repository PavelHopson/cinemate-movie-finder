namespace CineMate.Core;

public static class LocalMediaPolicy
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4", ".mkv", ".avi", ".mov", ".wmv", ".m4v", ".webm",
        ".ts", ".m2ts", ".mpg", ".mpeg", ".flv", ".ogv"
    };

    public static MediaValidationResult Validate(string? inputPath, bool requireExistingFile = true)
    {
        if (string.IsNullOrWhiteSpace(inputPath))
        {
            return MediaValidationResult.Deny("empty", "Выберите видеофайл.");
        }

        if (!Path.IsPathFullyQualified(inputPath) || Uri.TryCreate(inputPath, UriKind.Absolute, out var inputUri) && !inputUri.IsFile)
        {
            return MediaValidationResult.Deny("not-local", "Можно открыть только локальный файл с этого компьютера.");
        }

        string fullPath;
        try
        {
            fullPath = Path.GetFullPath(inputPath);
        }
        catch (Exception exception) when (exception is ArgumentException or NotSupportedException or PathTooLongException)
        {
            return MediaValidationResult.Deny("invalid-path", "Путь к файлу некорректен.");
        }

        if (fullPath.StartsWith("\\\\", StringComparison.Ordinal) || new Uri(fullPath).IsUnc)
        {
            return MediaValidationResult.Deny("network-path", "Сетевые пути отключены в первой версии. Скопируйте файл на этот компьютер.");
        }

        if (!AllowedExtensions.Contains(Path.GetExtension(fullPath)))
        {
            return MediaValidationResult.Deny("unsupported-extension", "Формат файла не входит в список поддерживаемых видеоформатов.");
        }

        if (!requireExistingFile)
        {
            return MediaValidationResult.Allow(fullPath);
        }

        if (!File.Exists(fullPath))
        {
            return MediaValidationResult.Deny("missing", "Файл не найден. Укажите его новое расположение.");
        }

        try
        {
            var info = new FileInfo(fullPath);
            if (info.Length <= 0)
            {
                return MediaValidationResult.Deny("empty-file", "Файл пуст или повреждён.");
            }
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            return MediaValidationResult.Deny("unreadable", "Нет доступа к файлу. Проверьте права и попробуйте снова.");
        }

        return MediaValidationResult.Allow(fullPath);
    }
}

public sealed record MediaValidationResult(bool IsAllowed, string? FullPath, string? ErrorCode, string? Message)
{
    public static MediaValidationResult Allow(string fullPath) => new(true, fullPath, null, null);

    public static MediaValidationResult Deny(string code, string message) => new(false, null, code, message);
}
