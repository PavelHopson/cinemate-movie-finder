using System.Text.Json.Serialization;

namespace CineMate.Core;

public sealed class LibraryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public long DurationMs { get; set; }
    public long ResumePositionMs { get; set; }
    public int Volume { get; set; } = 80;
    public bool IsMuted { get; set; }
    public bool IsCompleted { get; set; }
    public DateTimeOffset AddedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastPlayedAt { get; set; }

    [JsonIgnore]
    public bool IsAvailable
    {
        get
        {
            var validation = LocalMediaPolicy.Validate(FilePath, requireExistingFile: false);
            return validation.IsAllowed && validation.FullPath is not null && File.Exists(validation.FullPath);
        }
    }

    [JsonIgnore]
    public string AvailabilityText => IsAvailable ? "Готов к просмотру" : "Файл не найден";

    [JsonIgnore]
    public string ProgressText
    {
        get
        {
            if (IsCompleted)
            {
                return "Просмотрено";
            }

            if (ResumePositionMs <= 0)
            {
                return "Не начато";
            }

            return $"Продолжить с {FormatTime(ResumePositionMs)}";
        }
    }

    [JsonIgnore]
    public double ProgressPercent => DurationMs <= 0
        ? 0
        : Math.Clamp(ResumePositionMs * 100d / DurationMs, 0, 100);

    public void UpdateFile(string fullPath)
    {
        var info = new FileInfo(fullPath);
        FilePath = info.FullName;
        FileSizeBytes = info.Length;
        Title = Path.GetFileNameWithoutExtension(info.Name);
    }

    private static string FormatTime(long milliseconds)
    {
        var value = TimeSpan.FromMilliseconds(Math.Max(0, milliseconds));
        return value.TotalHours >= 1
            ? $"{(int)value.TotalHours}:{value.Minutes:00}:{value.Seconds:00}"
            : $"{value.Minutes}:{value.Seconds:00}";
    }
}
