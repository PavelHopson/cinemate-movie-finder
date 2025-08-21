// Управление избранными фильмами
export const FavoritesManager = {
  init() {
    this.loadFavorites();
    this.updateFavoritesCount();
    this.setupEventListeners();
  },
  
  getFavorites() {
    const favorites = localStorage.getItem('movie-favorites');
    return favorites ? JSON.parse(favorites) : [];
  },
  
  loadFavorites() {
    const favorites = this.getFavorites();
    return favorites;
  },
  
  isFavorite(movieId) {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.imdbID === movieId);
  },
  
  addFavorite(movie) {
    const favorites = this.getFavorites();
    // Проверяем, не добавлен ли уже фильм
    if (!favorites.some(fav => fav.imdbID === movie.imdbID)) {
      favorites.push(movie);
      localStorage.setItem('movie-favorites', JSON.stringify(favorites));
      this.updateFavoritesCount();
      return true;
    }
    return false;
  },
  
  removeFavorite(movieId) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(fav => fav.imdbID !== movieId);
    localStorage.setItem('movie-favorites', JSON.stringify(favorites));
    this.updateFavoritesCount();
    return true;
  },
  
  updateFavoritesCount() {
    const favorites = this.getFavorites();
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
      countElement.textContent = favorites.length;
    }
    
    // Обновляем отображение кнопки избранного в деталях фильма
    const favoriteBtn = document.querySelector('.movie-details-actions .favorite-btn');
    if (favoriteBtn) {
      const movieId = favoriteBtn.dataset.movieId;
      if (this.isFavorite(movieId)) {
        favoriteBtn.classList.add('active');
      } else {
        favoriteBtn.classList.remove('active');
      }
    }
  },
  
  setupEventListeners() {
    // Обработчик для кнопок избранного на карточках фильмов
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-button')) {
        e.preventDefault();
        const button = e.target.closest('.favorite-button');
        const movieId = button.dataset.movieId;
        const movieTitle = button.dataset.movieTitle;
        const moviePoster = button.dataset.moviePoster;
        const movieRating = button.dataset.movieRating;
        
        const movie = {
          imdbID: movieId,
          Title: movieTitle,
          Poster: moviePoster,
          imdbRating: movieRating
        };
        
        if (this.isFavorite(movieId)) {
          this.removeFavorite(movieId);
          button.classList.remove('active');
        } else {
          this.addFavorite(movie);
          button.classList.add('active');
        }
      }
    });
    
    // Обработчик для кнопки избранного в деталях фильма
    document.addEventListener('click', (e) => {
      if (e.target.closest('.movie-details-actions .favorite-btn')) {
        e.preventDefault();
        const button = e.target.closest('.movie-details-actions .favorite-btn');
        const movieId = button.dataset.movieId;
        
        if (this.isFavorite(movieId)) {
          this.removeFavorite(movieId);
          button.classList.remove('active');
        } else {
          // Нужно собрать данные о фильме из детального представления
          const movieTitle = document.querySelector('.movie-details-title').textContent;
          const moviePoster = document.querySelector('.movie-details-poster').src;
          const movieRating = document.querySelector('.movie-details-rating span').textContent.replace('/10', '');
          
          const movie = {
            imdbID: movieId,
            Title: movieTitle,
            Poster: moviePoster,
            imdbRating: movieRating
          };
          
          this.addFavorite(movie);
          button.classList.add('active');
        }
      }
    });
    
    // Обработчик для перехода в избранное
    const favoritesLink = document.getElementById('favorites-link');
    if (favoritesLink) {
      favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showFavorites();
      });
    }
    
    // Обработчик для кнопки "назад"
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSearchResults();
      });
    }
  },
  
  showFavorites() {
    document.getElementById('search-results').classList.remove('active');
    document.getElementById('movie-details').classList.remove('active');
    document.getElementById('favorites-section').classList.add('active');
    
    this.renderFavorites();
  },
  
  showSearchResults() {
    document.getElementById('favorites-section').classList.remove('active');
    document.getElementById('movie-details').classList.remove('active');
    document.getElementById('search-results').classList.add('active');
  },
  
  renderFavorites() {
    const favoritesContainer = document.getElementById('favorites-container');
    const favorites = this.getFavorites();
    
    if (favorites.length === 0) {
      favoritesContainer.innerHTML = `
        <div class="empty-favorites">
          <p>You haven't added any movies to favorites yet.</p>
        </div>
      `;
      return;
    }
    
    favoritesContainer.innerHTML = '';
    
    favorites.forEach(movie => {
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
          <h3 class="movie-title">${movie.Title}</h3>
          <div class="movie-meta">
            <div class="movie-rating">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}
            </div>
            <button class="favorite-button active" data-movie-id="${movie.imdbID}" data-movie-title="${movie.Title.replace(/"/g, '&quot;')}" data-movie-poster="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : ''}" data-movie-rating="${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 0}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      `;
      favoritesContainer.appendChild(movieCard);
    });
  }
};