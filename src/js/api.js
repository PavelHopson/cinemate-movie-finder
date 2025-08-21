import { ThemeManager } from './theme.js';
import { FavoritesManager } from './favorites.js';
import { OfflineManager } from './offline.js';
import { API } from './api.js';
import { UI } from './ui.js';

// Глобальная переменная для хранения текущих фильмов
let currentMovies = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем менеджеры
  ThemeManager.init();
  OfflineManager.init();
  FavoritesManager.init();
  
  // Настройка поиска с debounce
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const searchClear = document.getElementById('search-clear');
  const suggestions = document.getElementById('suggestions');
  const closeSuggestions = document.querySelector('.close-suggestions');
  
  let searchTimeout = null;
  
  const performSearch = async () => {
    const query = searchInput.value.trim();
    
    if (!query) {
      // Скрываем подсказки при пустом запросе
      suggestions.hidden = true;
      
      // Если запрос пустой, показываем популярные фильмы
      try {
        UI.showLoading();
        const data = await API.getPopularMovies();
        currentMovies = data.results || [];
        
        // Применяем сортировку
        const sortBy = document.getElementById('sort-by')?.value || 'relevance';
        const sortedMovies = UI.sortMovies(currentMovies, sortBy);
        UI.renderMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        
        // Пытаемся использовать офлайн-данные
        try {
          const movies = OfflineManager.getMovies();
          currentMovies = movies;
          
          // Применяем сортировку
          const sortBy = document.getElementById('sort-by')?.value || 'relevance';
          const sortedMovies = UI.sortMovies(currentMovies, sortBy);
          UI.renderMovies(sortedMovies);
          
          UI.showError('Используем офлайн-данные. Некоторые функции могут быть ограничены.');
        } catch (offlineError) {
          UI.showError('Не удалось загрузить фильмы. Проверьте подключение.');
        }
      } finally {
        UI.hideLoading();
      }
      return;
    }
    
    try {
      UI.showLoading();
      suggestions.hidden = true;
      
      if (!OfflineManager.isOnline) {
        // В офлайн-режиме ищем в локальных данных
        const movies = OfflineManager.getMovies();
        const results = movies.filter(movie => 
          movie.Title.toLowerCase().includes(query.toLowerCase())
        );
        
        currentMovies = results;
        
        // Применяем сортировку
        const sortBy = document.getElementById('sort-by')?.value || 'relevance';
        const sortedMovies = UI.sortMovies(currentMovies, sortBy);
        UI.renderMovies(sortedMovies);
      } else {
        // В онлайн-режиме используем API
        const data = await API.searchMovies(query);
        currentMovies = data.results || [];
        
        // Применяем сортировку
        const sortBy = document.getElementById('sort-by')?.value || 'relevance';
        const sortedMovies = UI.sortMovies(currentMovies, sortBy);
        UI.renderMovies(sortedMovies);
      }
    } catch (error) {
      console.error('Search error:', error);
      UI.showError('Поиск не удался. Попробуйте снова.');
      
      // Пытаемся использовать офлайн-данные для поиска
      try {
        const movies = OfflineManager.getMovies();
        const results = movies.filter(movie => 
          movie.Title.toLowerCase().includes(query.toLowerCase())
        );
        
        currentMovies = results;
        
        // Применяем сортировку
        const sortBy = document.getElementById('sort-by')?.value || 'relevance';
        const sortedMovies = UI.sortMovies(currentMovies, sortBy);
        UI.renderMovies(sortedMovies);
        
        UI.showError('Используем офлайн-данные для поиска. Результаты могут быть ограничены.');
      } catch (offlineError) {
        console.error('Offline search failed:', offlineError);
      }
    } finally {
      UI.hideLoading();
    }
  };
  
  const showSuggestions = () => {
    if (searchInput.value.trim() === '') {
      suggestions.hidden = false;
    }
  };
  
  const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    
    if (query === '') {
      suggestions.hidden = false;
    } else {
      suggestions.hidden = true;
      searchTimeout = setTimeout(performSearch, 300); // 300ms debounce
    }
  };
  
  // Добавляем обработчики событий
  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);
    searchInput.addEventListener('focus', showSuggestions);
  }
  
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      suggestions.hidden = false;
      searchInput.focus();
      debouncedSearch();
    });
  }
  
  // Обработчик для подсказок
  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInput.value = item.textContent;
      suggestions.hidden = true;
      performSearch();
    });
  });
  
  if (closeSuggestions) {
    closeSuggestions.addEventListener('click', () => {
      suggestions.hidden = true;
    });
  }
  
  // Переключение табов
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Скрываем все секции
      document.querySelectorAll('.results-section').forEach(section => {
        section.classList.remove('active');
        section.hidden = true;
      });
      
      // Скрываем табы
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      
      // Показываем выбранную секцию
      const tabId = tab.dataset.tab;
      const section = document.getElementById(tabId);
      if (section) {
        section.classList.add('active');
        section.hidden = false;
      }
      
      // Активируем таб
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      
      // Если это таб "Избранное", отображаем фильмы
      if (tabId === 'favorites-section') {
        FavoritesManager.renderFavorites();
      }
    });
  });
  
  // Обработчик для кнопки "Очистить всё" в избранном
  const clearFavorites = document.getElementById('clear-favorites');
  if (clearFavorites) {
    clearFavorites.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить все фильмы из избранного?')) {
        localStorage.removeItem('movie-favorites');
        FavoritesManager.updateFavoritesCount();
        FavoritesManager.renderFavorites();
        UI.showToast('Все фильмы удалены из избранного');
      }
    });
  }
  
  // Обработчик сортировки
  const sortBySelect = document.getElementById('sort-by');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', () => {
      // Применяем сортировку к текущим фильмам
      const sortBy = sortBySelect.value;
      const sortedMovies = UI.sortMovies(currentMovies, sortBy);
      UI.renderMovies(sortedMovies);
    });
  }
  
  // Добавляем обработчик для Enter
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  // При загрузке показываем популярные фильмы
  UI.renderSkeletons();
  performSearch();
});
