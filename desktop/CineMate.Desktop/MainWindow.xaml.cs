using System.Collections.ObjectModel;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using CineMate.Core;
using Microsoft.Win32;

namespace CineMate.Desktop;

public partial class MainWindow : Window
{
    private readonly LibraryStore _store = new();
    private readonly ObservableCollection<LibraryItem> _items = new();

    public MainWindow()
    {
        InitializeComponent();
        LibraryList.ItemsSource = _items;
        Loaded += MainWindow_Loaded;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            foreach (var item in _store.Load())
            {
                _items.Add(item);
            }

            if (_store.LastRecoveryMessage is not null)
            {
                SetStatus(_store.LastRecoveryMessage, isError: true);
            }
        }
        catch (Exception)
        {
            SetStatus("Не удалось открыть локальную фильмотеку. Проверьте доступ к папке приложения.", isError: true);
        }

        RefreshLibrary();
    }

    private void AddVideo_Click(object sender, RoutedEventArgs e)
    {
        var path = PickVideoFile();
        if (path is null)
        {
            return;
        }

        var validation = LocalMediaPolicy.Validate(path);
        if (!validation.IsAllowed || validation.FullPath is null)
        {
            SetStatus(validation.Message ?? "Не удалось добавить файл.", isError: true);
            return;
        }

        var existing = _items.FirstOrDefault(item => string.Equals(item.FilePath, validation.FullPath, StringComparison.OrdinalIgnoreCase));
        if (existing is not null)
        {
            LibraryList.SelectedItem = existing;
            LibraryList.ScrollIntoView(existing);
            SetStatus("Этот файл уже есть в фильмотеке.");
            return;
        }

        var item = new LibraryItem();
        item.UpdateFile(validation.FullPath);
        _items.Insert(0, item);
        SaveLibrary("Видео добавлено в личную фильмотеку.");
        LibraryList.SelectedItem = item;
        LibraryList.ScrollIntoView(item);
    }

    private void OpenVideo_Click(object sender, RoutedEventArgs e)
    {
        if ((sender as Button)?.Tag is not LibraryItem item)
        {
            return;
        }

        var validation = LocalMediaPolicy.Validate(item.FilePath);
        if (!validation.IsAllowed)
        {
            SetStatus(validation.Message ?? "Не удалось открыть файл.", isError: true);
            if (validation.ErrorCode == "missing")
            {
                RelinkItem(item);
            }
            return;
        }

        var player = new PlayerWindow(item, PersistPlaybackState)
        {
            Owner = this
        };
        player.Closed += (_, _) => RefreshLibrary();
        player.Show();
    }

    private void RelinkVideo_Click(object sender, RoutedEventArgs e)
    {
        if ((sender as Button)?.Tag is LibraryItem item)
        {
            RelinkItem(item);
        }
    }

    private void RelinkItem(LibraryItem item)
    {
        var path = PickVideoFile();
        if (path is null)
        {
            return;
        }

        var validation = LocalMediaPolicy.Validate(path);
        if (!validation.IsAllowed || validation.FullPath is null)
        {
            SetStatus(validation.Message ?? "Не удалось связать файл.", isError: true);
            return;
        }

        var newInfo = new FileInfo(validation.FullPath);
        var sameMedia = item.FileSizeBytes > 0 && item.FileSizeBytes == newInfo.Length;
        item.UpdateFile(validation.FullPath);
        if (!sameMedia)
        {
            item.DurationMs = 0;
            item.ResumePositionMs = 0;
            item.IsCompleted = false;
        }

        SaveLibrary(sameMedia
            ? "Расположение файла обновлено. Позиция просмотра сохранена."
            : "Подключён другой файл. Позиция просмотра сброшена.");
    }

    private void RemoveVideo_Click(object sender, RoutedEventArgs e)
    {
        if ((sender as Button)?.Tag is not LibraryItem item)
        {
            return;
        }

        var result = MessageBox.Show(
            this,
            "Удалить видео из личной фильмотеки? Сам файл останется на компьютере.",
            "Удалить из фильмотеки",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question,
            MessageBoxResult.No);
        if (result != MessageBoxResult.Yes)
        {
            return;
        }

        _items.Remove(item);
        SaveLibrary("Видео удалено из фильмотеки. Файл не изменён.");
    }

    private string? PickVideoFile()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Выберите локальный видеофайл",
            Filter = "Видеофайлы|*.mp4;*.mkv;*.avi;*.mov;*.wmv;*.m4v;*.webm;*.ts;*.m2ts;*.mpg;*.mpeg;*.flv;*.ogv|Все файлы|*.*",
            CheckFileExists = true,
            Multiselect = false
        };
        return dialog.ShowDialog(this) == true ? dialog.FileName : null;
    }

    private void PersistPlaybackState(LibraryItem item)
    {
        try
        {
            _store.Save(_items);
            Dispatcher.Invoke(RefreshLibrary);
        }
        catch (Exception)
        {
            Dispatcher.Invoke(() => SetStatus("Не удалось сохранить позицию просмотра. Попробуйте закрыть плеер ещё раз.", isError: true));
        }
    }

    private void SaveLibrary(string successMessage)
    {
        try
        {
            _store.Save(_items);
            SetStatus(successMessage);
        }
        catch (Exception)
        {
            SetStatus("Не удалось сохранить изменения локальной фильмотеки.", isError: true);
        }
        RefreshLibrary();
    }

    private void RefreshLibrary()
    {
        EmptyState.Visibility = _items.Count == 0 ? Visibility.Visible : Visibility.Collapsed;
        LibraryList.Visibility = _items.Count == 0 ? Visibility.Collapsed : Visibility.Visible;
        LibraryList.Items.Refresh();
    }

    private void SetStatus(string message, bool isError = false)
    {
        StatusText.Text = message;
        StatusText.Foreground = (System.Windows.Media.Brush)FindResource(isError ? "DangerBrush" : "MutedTextBrush");
    }
}
