import { ThemeManager } from './theme.js';
import { FavoritesManager } from './favorites.js';
import { OfflineManager } from './offline.js';
import { API } from './api.js';
import { UI } from './ui.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем менеджеры
  ThemeManager.init();
  OfflineManager.init();
  FavoritesManager.init();
  
  // Настройка поиска с debounce
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  let searchTimeout = null;
  
  const performSearch = async () => {
    const query = searchInput.value.trim();
    
    if (!query) {
      // Если запрос пустой, показываем популярные фильмы
      try {
        UI.showLoading();
        const data = await API.getPopularMovies();
        UI.renderMovies(data.results);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        
        // Пытаемся использовать офлайн-данные
        try {
          const movies = OfflineManager.getMovies();
          UI.renderMovies(movies);
          UI.showError('Using offline data. Some features may be limited.');
        } catch (offlineError) {
          UI.showError('Failed to load movies. Please check your connection.');
        }
      } finally {
        UI.hideLoading();
      }
      return;
    }
    
    try {
      UI.showLoading();
      
      if (!OfflineManager.isOnline) {
        // В офлайн-режиме ищем в локальных данных
        const movies = OfflineManager.getMovies();
        const results = movies.filter(movie => 
          movie.Title.toLowerCase().includes(query.toLowerCase())
        );
        UI.renderMovies(results);
      } else {
        // В онлайн-режиме используем API
        const data = await API.searchMovies(query);
        UI.renderMovies(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      UI.showError('Search failed. Please try again.');
      
      // Пытаемся использовать офлайн-данные для поиска
      try {
        const movies = OfflineManager.getMovies();
        const results = movies.filter(movie => 
          movie.Title.toLowerCase().includes(query.toLowerCase())
        );
        UI.renderMovies(results);
        UI.showError('Using offline data for search. Results may be limited.');
      } catch (offlineError) {
        console.error('Offline search failed:', offlineError);
      }
    } finally {
      UI.hideLoading();
    }
  };
  
  const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300); // 300ms debounce
  };
  
  // Добавляем обработчики событий
  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
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