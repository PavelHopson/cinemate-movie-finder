// Управление пользовательским интерфейсом
export const UI = {
  showLoading(elementId = 'loading') {
    const loadingElement = document.getElementById(elementId);
    if (loadingElement) {
      loadingElement.hidden = false;
    }
  },
  
  hideLoading(elementId = 'loading') {
    const loadingElement = document.getElementById(elementId);
    if (loadingElement) {
      loadingElement.hidden = true;
    }
  },
  
  showError(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.hidden = false;
      
      // Удаляем через 5 секунд
      setTimeout(() => {
        toast.hidden = true;
      }, 5000);
    }
  },
  
  showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.hidden = false;
      
      // Удаляем через 3 секунды
      setTimeout(() => {
        toast.hidden = true;
      }, 3000);
    }
  },
  
  sortMovies(movies, sortBy) {
    if (!movies || movies.length === 0) return movies;
    
    switch(sortBy) {
      case 'year':
        return [...movies].sort((a, b) => 
          parseInt(b.Year || 0) - parseInt(a.Year || 0));
      case 'rating':
        return [...movies].sort((a, b) => 
          (parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0))).reverse();
      default: // relevance
        return movies;
    }
  },
  
  renderMovies(movies, containerId = 'results-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    if (!movies || movies.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="10" y1="9" x2="10" y2="13"></line>
            <line x1="14" y1="9" x2="14" y2="13"></line>
            <line x1="12" y1="17" x2="12" y2="17"></line>
          </svg>
          <p>Фильмы не найдены. Попробуйте другой запрос.</p>
        </div>
      `;
      return;
    }
    
    // Рендерим карточки фильмов
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <div class="movie-card-inner">
          <div class="movie-poster-container">
            <img 
              src="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}" 
              alt="${movie.Title} (${movie.Year})" 
              class="movie-poster"
              onerror="this.onerror=null; this.src='/placeholder.jpg';"
            >
            <div class="movie-overlay">
              <button class="details-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Подробнее
              </button>
            </div>
          </div>
          <div class="movie-info">
            <div class="movie-header">
              <h3 class="movie-title">${movie.Title}</h3>
              <span class="movie-year">(${movie.Year})</span>
            </div>
            <p class="movie-type">${movie.Type}</p>
            <div class="movie-meta">
              <div class="movie-rating">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}
              </div>
              <button class="favorite-button ${FavoritesManager.isFavorite(movie.imdbID) ? 'active' : ''}" 
                      data-movie-id="${movie.imdbID}" 
                      data-movie-title="${movie.Title.replace(/"/g, '&quot;')}"
                      data-movie-poster="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : ''}"
                      data-movie-rating="${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 0}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(movie.imdbID) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="sr-only">${FavoritesManager.isFavorite(movie.imdbID) ? 'Убрать из избранного' : 'Добавить в избранное'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Добавляем обработчик клика для перехода к деталям
      movieCard.querySelector('.details-button').addEventListener('click', (e) => {
        e.stopPropagation();
        this.showMovieDetails(movie.imdbID);
      });
      
      // Добавляем обработчик клика для всей карточки
      movieCard.addEventListener('click', (e) => {
        if (!e.target.closest('.favorite-button')) {
          this.showMovieDetails(movie.imdbID);
        }
      });
      
      container.appendChild(movieCard);
    });
  },
  
  renderMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details-container');
    if (!detailsContainer) return;
    
    // Форматируем дату
    const formatDate = (dateString) => {
      if (!dateString || dateString === 'N/A') return 'N/A';
      return dateString;
    };
    
    // Получаем жанры
    const genres = movie.Genre && movie.Genre !== 'N/A' ? movie.Genre : 'N/A';
    
    // Формируем HTML
    detailsContainer.innerHTML = `
      <div class="movie-details-header">
        <img 
          src="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}" 
          alt="${movie.Title}" 
          class="movie-details-poster"
          onerror="this.onerror=null; this.src='/placeholder.jpg';"
        >
        <div class="movie-details-info">
          <h1 class="movie-details-title">${movie.Title} <span class="movie-details-year">(${movie.Year})</span></h1>
          <div class="movie-details-meta">
            <span class="movie-details-released">${formatDate(movie.Released)}</span>
            <span class="movie-details-genre">${genres}</span>
            <div class="movie-details-rating">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}/10</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="movie-details-content">
        <div class="movie-details-overview">
          <h2>Описание</h2>
          <p>${movie.Plot || 'Описание недоступно.'}</p>
        </div>
        
        <div class="movie-details-meta-info">
          <div class="meta-row">
            <span class="meta-label">Режиссер:</span>
            <span class="meta-value">${movie.Director || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Сценарий:</span>
            <span class="meta-value">${movie.Writer || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">В ролях:</span>
            <span class="meta-value">${movie.Actors || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Продолжительность:</span>
            <span class="meta-value">${movie.Runtime || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Страна:</span>
            <span class="meta-value">${movie.Country || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Язык:</span>
            <span class="meta-value">${movie.Language || 'N/A'}</span>
          </div>
        </div>
        
        <div class="movie-details-actions">
          <button class="favorite-btn ${FavoritesManager.isFavorite(movie.imdbID) ? 'active' : ''}" 
                  data-movie-id="${movie.imdbID}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(movie.imdbID) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            ${FavoritesManager.isFavorite(movie.imdbID) ? 'Убрать из избранного' : 'Добавить в избранное'}
          </button>
          ${movie.Website && movie.Website !== 'N/A' ? `
          <a href="${movie.Website}" target="_blank" rel="noopener" class="details-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            Официальный сайт
          </a>
          ` : ''}
        </div>
      </div>
    `;
    
    // Показываем секцию с деталями
    document.getElementById('search-results').classList.remove('active');
    document.getElementById('favorites-section').classList.remove('active');
    document.getElementById('movie-details').classList.add('active');
    document.getElementById('movie-details').hidden = false;
  },
  
  async showMovieDetails(imdbID) {
    try {
      this.showLoading();
      
      // Проверяем онлайн-статус
      if (!OfflineManager.isOnline) {
        // В офлайн-режиме используем fallback данные
        const fallbackMovie = OfflineManager.getMovies().find(m => m.imdbID === imdbID);
        if (fallbackMovie) {
          this.renderMovieDetails(fallbackMovie);
        } else {
          this.showError('Детали фильма недоступны в офлайн-режиме');
        }
      } else {
        // В онлайн-режиме запрашиваем данные через API
        const movie = await API.getMovieDetails(imdbID);
        this.renderMovieDetails(movie);
      }
    } catch (error) {
      this.showError('Не удалось загрузить детали фильма');
      console.error('Error loading movie details:', error);
    } finally {
      this.hideLoading();
    }
  },
  
  renderSkeletons(count = 6) {
    const container = document.getElementById('results-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'movie-card skeleton';
      skeleton.innerHTML = `
        <div class="movie-card-inner">
          <div class="movie-poster-container">
            <div class="skeleton movie-poster"></div>
            <div class="movie-overlay">
              <button class="details-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Подробнее
              </button>
            </div>
          </div>
          <div class="movie-info">
            <div class="movie-header">
              <h3 class="skeleton movie-title"></h3>
              <span class="skeleton movie-year"></span>
            </div>
            <p class="skeleton movie-type"></p>
            <div class="movie-meta">
              <div class="skeleton movie-rating"></div>
              <div class="skeleton favorite-button"></div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(skeleton);
    }
  }
};
