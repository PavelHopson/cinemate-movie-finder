using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Threading;
using CineMate.Core;
using LibVLCSharp.Shared;

namespace CineMate.Desktop;

public partial class PlayerWindow : Window
{
    private readonly LibraryItem _item;
    private readonly Action<LibraryItem> _persist;
    private readonly Func<Action, Task> _runNativeShutdown;
    private readonly DispatcherTimer _saveTimer;
    private readonly DispatcherTimer _trackRefreshTimer;
    private readonly DispatcherTimer _openValidationTimer;
    private LibVLC? _libVlc;
    private MediaPlayer? _mediaPlayer;
    private Media? _media;
    private bool _isSeeking;
    private bool _resumeApplied;
    private bool _isFullscreen;
    private bool _isClosing;
    private bool _allowClose;
    private int _trackRefreshAttempts;
    private WindowStyle _previousWindowStyle;
    private WindowState _previousWindowState;

    public PlayerWindow(LibraryItem item, Action<LibraryItem> persist)
        : this(item, persist, action => Task.Run(action))
    {
    }

    // Trusted in-process test seam; never configured by environment, media or IPC.
    internal PlayerWindow(LibraryItem item, Action<LibraryItem> persist, Func<Action, Task> runNativeShutdown)
    {
        _item = item;
        _persist = persist;
        _runNativeShutdown = runNativeShutdown;
        var persistedVolume = item.Volume;
        InitializeComponent();

        MovieTitle.Text = item.Title;
        // XAML initialization raises ValueChanged with the default value.
        VolumeSlider.Value = Math.Clamp(persistedVolume, 0, 100);
        UpdateMuteLabel(item.IsMuted);

        _saveTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(5) };
        _saveTimer.Tick += (_, _) => SaveProgress();

        _trackRefreshTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(600) };
        _trackRefreshTimer.Tick += (_, _) =>
        {
            _trackRefreshAttempts++;
            PopulateTracks();
            if (_trackRefreshAttempts >= 6)
            {
                _trackRefreshTimer.Stop();
            }
        };

        _openValidationTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(2) };
        _openValidationTimer.Tick += (_, _) =>
        {
            _openValidationTimer.Stop();
            var player = _mediaPlayer;
            if (player is null || _item.IsCompleted || player.State is VLCState.Ended or VLCState.Stopped)
            {
                return;
            }
            var hasPlayableTrack = player.VideoTrackDescription.Any(track => track.Id >= 0) ||
                player.AudioTrackDescription.Any(track => track.Id >= 0);
            if (player.Length <= 0 || !hasPlayableTrack)
            {
                ShowPlaybackError("В файле не найден воспроизводимый видео- или аудиопоток. Файл может быть повреждён или иметь неподдерживаемый формат.");
            }
        };

        Loaded += PlayerWindow_Loaded;
        Closing += PlayerWindow_Closing;
    }

    private void PlayerWindow_Loaded(object sender, RoutedEventArgs e)
    {
        InitializePlayer();
        OpenCurrentFile();
    }

    private void InitializePlayer()
    {
        try
        {
            LibVLCSharp.Shared.Core.Initialize();
            _libVlc = new LibVLC(
                "--no-video-title-show",
                "--no-metadata-network-access",
                "--quiet");
            _mediaPlayer = new MediaPlayer(_libVlc)
            {
                Volume = Math.Clamp(_item.Volume, 0, 100),
                Mute = _item.IsMuted
            };
            VideoView.MediaPlayer = _mediaPlayer;
            AttachPlayerEvents(_mediaPlayer);
        }
        catch (Exception)
        {
            ShowPlaybackError("Не удалось запустить встроенный медиадвижок. Переустановите приложение или проверьте целостность его файлов.");
        }
    }

    private void OpenCurrentFile()
    {
        if (_libVlc is null || _mediaPlayer is null)
        {
            return;
        }

        var validation = LocalMediaPolicy.Validate(_item.FilePath);
        if (!validation.IsAllowed || validation.FullPath is null)
        {
            ShowPlaybackError(validation.Message ?? "Файл недоступен.");
            return;
        }

        ErrorPanel.Visibility = Visibility.Collapsed;
        VideoView.Visibility = Visibility.Visible;
        PlayPauseButton.IsEnabled = true;
        PlaybackStatus.Text = "Открываем локальный файл…";
        _resumeApplied = false;

        _media?.Dispose();
        _media = new Media(_libVlc, new Uri(validation.FullPath));
        _media.AddOption(":no-metadata-network-access");

        if (!_mediaPlayer.Play(_media))
        {
            ShowPlaybackError("Движок не смог открыть файл. Формат может быть повреждён или не поддерживаться этой сборкой.");
            return;
        }

        _saveTimer.Start();
    }

    private void AttachPlayerEvents(MediaPlayer player)
    {
        player.Opening += (_, _) => OnUi(() => PlaybackStatus.Text = "Подготовка видео…");
        player.Buffering += (_, args) => OnUi(() => PlaybackStatus.Text = args.Cache < 100 ? $"Буферизация: {args.Cache:0}%" : "Готово");
        player.Playing += (_, _) => OnUi(OnPlaying);
        player.Paused += (_, _) => OnUi(() =>
        {
            PlayPauseButton.Content = "Продолжить";
            PlaybackStatus.Text = "Пауза";
            SaveProgress();
        });
        player.Stopped += (_, _) => OnUi(() =>
        {
            PlayPauseButton.Content = "Воспроизвести";
            PlaybackStatus.Text = "Воспроизведение остановлено";
        });
        player.EndReached += (_, _) => OnUi(() =>
        {
            _item.IsCompleted = true;
            _item.ResumePositionMs = 0;
            PlayPauseButton.Content = "Смотреть снова";
            PlaybackStatus.Text = "Просмотр завершён";
            _persist(_item);
        });
        player.EncounteredError += (_, _) => OnUi(() =>
            ShowPlaybackError("Файл повреждён или содержит неподдерживаемый поток. Выберите другой файл либо повторите после проверки файла."));
        player.LengthChanged += (_, args) => OnUi(() =>
        {
            SeekSlider.Maximum = Math.Max(1, args.Length);
            DurationText.Text = FormatTime(args.Length);
            _item.DurationMs = Math.Max(0, args.Length);
            ApplyResumePosition();
        });
        player.TimeChanged += (_, args) => OnUi(() =>
        {
            if (!_isSeeking)
            {
                SeekSlider.Value = Math.Clamp(args.Time, 0, Math.Max(1, SeekSlider.Maximum));
                CurrentTimeText.Text = FormatTime(args.Time);
            }
        });
    }

    private void OnPlaying()
    {
        PlayPauseButton.Content = "Пауза";
        PlaybackStatus.Text = "Воспроизведение";
        _item.IsCompleted = false;
        ApplyResumePosition();
        _trackRefreshAttempts = 0;
        _trackRefreshTimer.Stop();
        _trackRefreshTimer.Start();
        _openValidationTimer.Stop();
        _openValidationTimer.Start();
    }

    private void ApplyResumePosition()
    {
        if (_resumeApplied || _mediaPlayer is null || _item.ResumePositionMs <= 0 || _mediaPlayer.Length <= 0)
        {
            return;
        }

        var safePosition = Math.Min(_item.ResumePositionMs, Math.Max(0, _mediaPlayer.Length - 2_000));
        if (safePosition > 0)
        {
            _mediaPlayer.Time = safePosition;
            PlaybackStatus.Text = $"Продолжено с {FormatTime(safePosition)}";
        }
        _resumeApplied = true;
    }

    private void PopulateTracks()
    {
        if (_mediaPlayer is null)
        {
            return;
        }

        var selectedAudio = _mediaPlayer.AudioTrack;
        var audioOptions = _mediaPlayer.AudioTrackDescription
            .Where(track => track.Id >= 0)
            .Select((track, index) => new TrackOption(track.Id, string.IsNullOrWhiteSpace(track.Name) ? $"Дорожка {index + 1}" : track.Name))
            .ToList();
        AudioTracks.ItemsSource = audioOptions;
        AudioTracks.IsEnabled = audioOptions.Count > 1;
        AudioTracks.SelectedItem = audioOptions.FirstOrDefault(track => track.Id == selectedAudio) ?? audioOptions.FirstOrDefault();

        var selectedSubtitle = _mediaPlayer.Spu;
        var subtitleOptions = new List<TrackOption> { new(-1, "Выключены") };
        subtitleOptions.AddRange(_mediaPlayer.SpuDescription
            .Where(track => track.Id >= 0)
            .Select((track, index) => new TrackOption(track.Id, string.IsNullOrWhiteSpace(track.Name) ? $"Субтитры {index + 1}" : track.Name)));
        SubtitleTracks.ItemsSource = subtitleOptions;
        SubtitleTracks.IsEnabled = subtitleOptions.Count > 1;
        SubtitleTracks.SelectedItem = subtitleOptions.FirstOrDefault(track => track.Id == selectedSubtitle) ?? subtitleOptions[0];

        if (_mediaPlayer.IsPlaying)
        {
            PlaybackStatus.Text = $"Воспроизведение · аудиодорожек: {audioOptions.Count} · субтитров: {subtitleOptions.Count - 1}";
        }
    }

    private void PlayPause_Click(object sender, RoutedEventArgs e) => TogglePlayPause();

    private void TogglePlayPause()
    {
        if (_mediaPlayer is null)
        {
            return;
        }

        if (_item.IsCompleted)
        {
            _mediaPlayer.Time = 0;
            _item.IsCompleted = false;
        }

        if (_mediaPlayer.IsPlaying)
        {
            _mediaPlayer.Pause();
        }
        else
        {
            _mediaPlayer.Play();
        }
    }

    private void BackTen_Click(object sender, RoutedEventArgs e) => SeekRelative(-10_000);
    private void ForwardTen_Click(object sender, RoutedEventArgs e) => SeekRelative(10_000);

    private void SeekRelative(long delta)
    {
        if (_mediaPlayer is null || !_mediaPlayer.IsSeekable)
        {
            PlaybackStatus.Text = "Этот файл не поддерживает перемотку";
            return;
        }
        _mediaPlayer.Time = Math.Clamp(_mediaPlayer.Time + delta, 0, Math.Max(0, _mediaPlayer.Length - 250));
    }

    private void SeekSlider_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e) => _isSeeking = true;

    private void SeekSlider_PreviewMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
    {
        CommitSeek();
        _isSeeking = false;
    }

    private void SeekSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_isSeeking)
        {
            CurrentTimeText.Text = FormatTime((long)e.NewValue);
        }
    }

    private void CommitSeek()
    {
        if (_mediaPlayer is not null && _mediaPlayer.IsSeekable)
        {
            _mediaPlayer.Time = (long)SeekSlider.Value;
        }
    }

    private void VolumeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        _item.Volume = (int)Math.Round(e.NewValue);
        if (_mediaPlayer is not null)
        {
            _mediaPlayer.Volume = _item.Volume;
            if (_item.Volume > 0 && _mediaPlayer.Mute)
            {
                _mediaPlayer.Mute = false;
                _item.IsMuted = false;
                UpdateMuteLabel(false);
            }
        }
    }

    private void Mute_Click(object sender, RoutedEventArgs e)
    {
        if (_mediaPlayer is null)
        {
            return;
        }
        _mediaPlayer.Mute = !_mediaPlayer.Mute;
        _item.IsMuted = _mediaPlayer.Mute;
        UpdateMuteLabel(_mediaPlayer.Mute);
    }

    private void UpdateMuteLabel(bool isMuted) => MuteButton.Content = isMuted ? "Включить звук" : "Выключить звук";

    private void AudioTracks_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (_mediaPlayer is not null && AudioTracks.SelectedItem is TrackOption option)
        {
            _mediaPlayer.SetAudioTrack(option.Id);
        }
    }

    private void SubtitleTracks_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (_mediaPlayer is not null && SubtitleTracks.SelectedItem is TrackOption option)
        {
            _mediaPlayer.SetSpu(option.Id);
        }
    }

    private void Fullscreen_Click(object sender, RoutedEventArgs e) => ToggleFullscreen();

    private void ToggleFullscreen()
    {
        if (!_isFullscreen)
        {
            _previousWindowStyle = WindowStyle;
            _previousWindowState = WindowState;
            WindowStyle = WindowStyle.None;
            WindowState = WindowState.Maximized;
            TitleBar.Visibility = Visibility.Collapsed;
            _isFullscreen = true;
        }
        else
        {
            WindowStyle = _previousWindowStyle;
            WindowState = _previousWindowState;
            TitleBar.Visibility = Visibility.Visible;
            _isFullscreen = false;
        }
    }

    private void Retry_Click(object sender, RoutedEventArgs e) => OpenCurrentFile();
    private void Close_Click(object sender, RoutedEventArgs e) => Close();

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Escape && _isFullscreen)
        {
            ToggleFullscreen();
            e.Handled = true;
            return;
        }

        if (Keyboard.FocusedElement is ComboBox)
        {
            return;
        }

        switch (e.Key)
        {
            case Key.Space:
                TogglePlayPause();
                e.Handled = true;
                break;
            case Key.Left:
                SeekRelative(-10_000);
                e.Handled = true;
                break;
            case Key.Right:
                SeekRelative(10_000);
                e.Handled = true;
                break;
            case Key.M:
                Mute_Click(this, new RoutedEventArgs());
                e.Handled = true;
                break;
            case Key.F:
                ToggleFullscreen();
                e.Handled = true;
                break;
        }
    }

    private void ShowPlaybackError(string message)
    {
        _saveTimer.Stop();
        _trackRefreshTimer.Stop();
        _openValidationTimer.Stop();
        ErrorText.Text = message;
        ErrorPanel.Visibility = Visibility.Visible;
        VideoView.Visibility = Visibility.Collapsed;
        PlaybackStatus.Text = "Ошибка открытия файла";
        PlayPauseButton.IsEnabled = false;
    }

    private void SaveProgress()
    {
        if (_mediaPlayer is null || _mediaPlayer.Length <= 0 || _item.IsCompleted)
        {
            return;
        }

        _item.ResumePositionMs = Math.Clamp(_mediaPlayer.Time, 0, _mediaPlayer.Length);
        _item.DurationMs = _mediaPlayer.Length;
        _item.Volume = Math.Clamp(_mediaPlayer.Volume, 0, 100);
        _item.IsMuted = _mediaPlayer.Mute;
        _item.LastPlayedAt = DateTimeOffset.UtcNow;
        _persist(_item);
    }

    private async void PlayerWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        if (_allowClose)
        {
            return;
        }
        // LibVLC Stop can wait for the native video window. Keep the WPF
        // dispatcher responsive until native teardown has actually finished.
        e.Cancel = true;
        if (_isClosing)
        {
            return;
        }
        _isClosing = true;
        _saveTimer.Stop();
        _trackRefreshTimer.Stop();
        _openValidationTimer.Stop();
        SaveProgress();
        VideoView.MediaPlayer = null;
        var player = _mediaPlayer;
        var media = _media;
        var libVlc = _libVlc;
        _mediaPlayer = null;
        _media = null;
        _libVlc = null;
        try
        {
            await _runNativeShutdown(() =>
            {
                try { player?.Stop(); }
                finally
                {
                    media?.Dispose();
                    player?.Dispose();
                    libVlc?.Dispose();
                }
            });
            _allowClose = true;
            // A completed task may continue inside the original Closing event.
            // Queue the final close instead of re-entering that event inline.
            _ = Dispatcher.BeginInvoke(new Action(Close));
        }
        catch (Exception)
        {
            // Native state is uncertain: no retry, no resume, no success claim.
            // Keep feedback visible, but allow the user's next Close to finish.
            _allowClose = true;
            PlaybackStatus.Text = "Ошибка завершения медиадвижка. Закройте плеер и перезапустите CineMate.";
            PlayPauseButton.IsEnabled = false;
        }
    }

    private void OnUi(Action action)
    {
        if (!_isClosing)
        {
            Dispatcher.BeginInvoke(() =>
            {
                if (!_isClosing) { action(); }
            });
        }
    }

    private static string FormatTime(long milliseconds)
    {
        var value = TimeSpan.FromMilliseconds(Math.Max(0, milliseconds));
        return value.TotalHours >= 1
            ? $"{(int)value.TotalHours}:{value.Minutes:00}:{value.Seconds:00}"
            : $"{value.Minutes}:{value.Seconds:00}";
    }

    private sealed record TrackOption(int Id, string Label);
}
