using System.Text.Json;

namespace CineMate.Core;

public sealed class LibraryStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public LibraryStore(string? dataDirectory = null)
    {
        dataDirectory ??= Environment.GetEnvironmentVariable("CINEMATE_DATA_DIRECTORY");
        if (!string.IsNullOrWhiteSpace(dataDirectory))
        {
            if (!Path.IsPathFullyQualified(dataDirectory) || Path.GetFullPath(dataDirectory).StartsWith("\\\\", StringComparison.Ordinal))
            {
                throw new ArgumentException("CineMate data directory must be a local absolute path.", nameof(dataDirectory));
            }
            DataDirectory = Path.GetFullPath(dataDirectory);
        }
        else
        {
            DataDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "CineMate",
                "data");
        }
        LibraryPath = Path.Combine(DataDirectory, "library.json");
    }

    public string DataDirectory { get; }
    public string LibraryPath { get; }
    public string? LastRecoveryMessage { get; private set; }

    public IReadOnlyList<LibraryItem> Load()
    {
        LastRecoveryMessage = null;
        if (!File.Exists(LibraryPath))
        {
            return Array.Empty<LibraryItem>();
        }

        try
        {
            var json = File.ReadAllText(LibraryPath);
            var items = JsonSerializer.Deserialize<List<LibraryItem>>(json, JsonOptions) ?? new List<LibraryItem>();
            return items
                .Where(item => item.Id != Guid.Empty && !string.IsNullOrWhiteSpace(item.FilePath))
                .GroupBy(item => item.Id)
                .Select(group => group.First())
                .OrderByDescending(item => item.LastPlayedAt ?? item.AddedAt)
                .ToList();
        }
        catch (Exception exception) when (exception is JsonException or IOException or UnauthorizedAccessException)
        {
            Directory.CreateDirectory(DataDirectory);
            var backupPath = Path.Combine(DataDirectory, $"library.corrupt-{DateTime.UtcNow:yyyyMMddHHmmss}.json");
            try
            {
                File.Copy(LibraryPath, backupPath, overwrite: false);
                LastRecoveryMessage = "Данные фильмотеки повреждены. Создана резервная копия; можно добавить файлы заново.";
            }
            catch (Exception backupException) when (backupException is IOException or UnauthorizedAccessException)
            {
                LastRecoveryMessage = "Данные фильмотеки повреждены и не удалось создать резервную копию.";
            }

            return Array.Empty<LibraryItem>();
        }
    }

    public void Save(IEnumerable<LibraryItem> items)
    {
        Directory.CreateDirectory(DataDirectory);
        var uniqueItems = items
            .GroupBy(item => item.Id)
            .Select(group => group.First())
            .OrderByDescending(item => item.LastPlayedAt ?? item.AddedAt)
            .ToList();

        var temporaryPath = LibraryPath + ".tmp";
        var json = JsonSerializer.Serialize(uniqueItems, JsonOptions);
        File.WriteAllText(temporaryPath, json);
        File.Move(temporaryPath, LibraryPath, overwrite: true);
    }
}
