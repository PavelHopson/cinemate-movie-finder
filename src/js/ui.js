// Управление пользовательским интерфейсом
export const UI = {
  showLoading(elementId = 'loading') {
    const loadingElement = document.getElementById(elementId);
    if (loadingElement) {
      loadingElement.classList.add('active');
    }
  },
  
  hideLoading(elementId = 'loading') {
    const loadingElement = document.getElementById(elementId);
    if (loadingElement) {
      loadingElement.classList.remove('active');
    }
  },
  
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Добавляем в начало основного контента
    const main = document.querySelector('.main');
    if (main) {
      main.prepend(errorElement);
      
      // Удаляем через 5 секунд
      setTimeout(() => {
        errorElement.remove();
      }, 5000);
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
          <p>No movies found. Try a different search.</p>
        </div>
      `;
      return;
    }
    
    // Рендерим карточки фильмов
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <img 
          src="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}" 
          alt="${movie.Title}" 
          class="movie-poster"
          onerror="this.onerror=null; this.src='/placeholder.jpg';"
        >
        <div class="movie-info">
          <h3 class="movie-title">${movie.Title} (${movie.Year})</h3>
          <p class="movie-overview">${movie.Plot || 'No overview available.'}</p>
          <div class="movie-meta">
            <div class="movie-rating">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}
            </div>
            <button class="favorite-button ${FavoritesManager.isFavorite(movie.imdbID) ? 'active' : ''}" 
                    data-movie-id="${movie.imdbID}" 
                    data-movie-title="${movie.Title.replace(/"/g, '&quot;')}"
                    data-movie-poster="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : ''}"
                    data-movie-rating="${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 0}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(movie.imdbID) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      `;
      
      // Добавляем обработчик клика для перехода к деталям
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
      <img 
        src="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}" 
        alt="${movie.Title}" 
        class="movie-details-poster"
        onerror="this.onerror=null; this.src='/placeholder.jpg';"
      >
      <div class="movie-details-info">
        <h1 class="movie-details-title">${movie.Title} (${movie.Year})</h1>
        <div class="movie-details-meta">
          <span>${formatDate(movie.Released)}</span>
          <span>${genres}</span>
          <div class="movie-details-rating">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}/10</span>
          </div>
        </div>
        <p class="movie-details-overview">${movie.Plot || 'No overview available.'}</p>
        
        <div class="movie-details-meta-info">
          <p><strong>Director:</strong> ${movie.Director || 'N/A'}</p>
          <p><strong>Writer:</strong> ${movie.Writer || 'N/A'}</p>
          <p><strong>Actors:</strong> ${movie.Actors || 'N/A'}</p>
          <p><strong>Runtime:</strong> ${movie.Runtime || 'N/A'}</p>
          <p><strong>Genre:</strong> ${genres}</p>
          <p><strong>Language:</strong> ${movie.Language || 'N/A'}</p>
          <p><strong>Country:</strong> ${movie.Country || 'N/A'}</p>
        </div>
        
        <div class="movie-details-actions">
          <button class="favorite-btn ${FavoritesManager.isFavorite(movie.imdbID) ? 'active' : ''}" 
                  data-movie-id="${movie.imdbID}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(movie.imdbID) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${FavoritesManager.isFavorite(movie.imdbID) ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          ${movie.Website && movie.Website !== 'N/A' ? `
          <a href="${movie.Website}" target="_blank" class="details-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            Official Site
          </a>
          ` : ''}
        </div>
      </div>
    `;
    
    // Показываем секцию с деталями
    document.getElementById('search-results').classList.remove('active');
    document.getElementById('favorites-section').classList.remove('active');
    document.getElementById('movie-details').classList.add('active');
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
          this.showError('Movie details not available in offline mode');
        }
      } else {
        // В онлайн-режиме запрашиваем данные через API
        const movie = await API.getMovieDetails(imdbID);
        this.renderMovieDetails(movie);
      }
    } catch (error) {
      this.showError('Failed to load movie details');
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
        <div class="skeleton skeleton-poster"></div>
        <div class="movie-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-overview"></div>
          <div class="skeleton skeleton-meta"></div>
        </div>
      `;
      container.appendChild(skeleton);
    }
  }
};