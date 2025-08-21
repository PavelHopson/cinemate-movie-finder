// Управление офлайн-режимом
export const OfflineManager = {
  isOnline: true,
  fallbackData: null,
  
  init() {
    this.checkNetworkStatus();
    this.setupEventListeners();
    this.loadFallbackData();
  },
  
  async loadFallbackData() {
    try {
      const response = await fetch('/data/fallback.json');
      if (response.ok) {
        this.fallbackData = await response.json();
      } else {
        // Если не удалось загрузить fallback.json, используем встроенные данные
        this.fallbackData = this.getDefaultFallbackData();
      }
    } catch (error) {
      console.error('Error loading fallback data:', error);
      this.fallbackData = this.getDefaultFallbackData();
    }
  },
  
  getDefaultFallbackData() {
    return {
      offline: true,
      timestamp: Date.now(),
      movies: [
        {
          Title: "The Shawshank Redemption",
          Year: "1994",
          imdbID: "tt0111161",
          Type: "movie",
          Poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDE2LWViOTQtOGU0YjFiNzdiNWE3Y2FmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
          Plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
          imdbRating: "9.3",
          Released: "14 Oct 1994",
          Genre: "Drama",
          Director: "Frank Darabont",
          Writer: "Stephen King, Frank Darabont",
          Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
          Runtime: "142 min",
          Language: "English",
          Country: "USA"
        },
        {
          Title: "The Godfather",
          Year: "1972",
          imdbID: "tt0068646",
          Type: "movie",
          Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
          Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
          imdbRating: "9.2",
          Released: "24 Mar 1972",
          Genre: "Crime, Drama",
          Director: "Francis Ford Coppola",
          Writer: "Mario Puzo, Francis Ford Coppola",
          Actors: "Marlon Brando, Al Pacino, James Caan",
          Runtime: "175 min",
          Language: "English, Italian, Latin",
          Country: "USA"
        },
        {
          Title: "The Dark Knight",
          Year: "2008",
          imdbID: "tt0468569",
          Type: "movie",
          Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
          Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
          imdbRating: "9.0",
          Released: "18 Jul 2008",
          Genre: "Action, Crime, Drama",
          Director: "Christopher Nolan",
          Writer: "Jonathan Nolan, Christopher Nolan, David S. Goyer",
          Actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
          Runtime: "152 min",
          Language: "English, Mandarin",
          Country: "USA, UK"
        },
        {
          Title: "12 Angry Men",
          Year: "1957",
          imdbID: "tt0050083",
          Type: "movie",
          Poster: "https://m.media-amazon.com/images/M/MV5BMWU4N25jiTk1M19kLWJiM2YtY2ZjYTY3YjRlNGJjNGFiZmJjY2NlNzNkYWJhNmU0NGNjNDJmMjNlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg",
          Plot: "A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",
          imdbRating: "9.0",
          Released: "10 Apr 1957",
          Genre: "Crime, Drama",
          Director: "Sidney Lumet",
          Writer: "Reginald Rose",
          Actors: "Henry Fonda, Lee J. Cobb, Martin Balsam",
          Runtime: "96 min",
          Language: "English",
          Country: "USA"
        },
        {
          Title: "Schindler's List",
          Year: "1993",
          imdbID: "tt0108052",
          Type: "movie",
          Poster: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UWMGM3NTJkXkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg",
          Plot: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
          imdbRating: "9.0",
          Released: "4 Feb 1994",
          Genre: "Biography, Drama, History",
          Director: "Steven Spielberg",
          Writer: "Thomas Keneally, Steven Zaillian",
          Actors: "Liam Neeson, Ralph Fiennes, Ben Kingsley",
          Runtime: "195 min",
          Language: "English, Hebrew, German, Polish, Italian",
          Country: "USA"
        },
        {
          Title: "The Lord of the Rings: The Return of the King",
          Year: "2003",
          imdbID: "tt0167260",
          Type: "movie",
          Poster: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg",
          Plot: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
          imdbRating: "9.0",
          Released: "17 Dec 2003",
          Genre: "Action, Adventure, Drama",
          Director: "Peter Jackson",
          Writer: "J.R.R. Tolkien, Fran Walsh",
          Actors: "Elijah Wood, Viggo Mortensen, Ian McKellen",
          Runtime: "201 min",
          Language: "English, Quenya, Sindarin, Black Speech",
          Country: "New Zealand, USA"
        }
      ]
    };
  },
  
  checkNetworkStatus() {
    this.isOnline = navigator.onLine;
    this.updateNetworkStatus();
  },
  
  updateNetworkStatus() {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
      if (this.isOnline) {
        statusElement.classList.remove('offline');
        statusElement.classList.add('online');
        statusElement.querySelector('span').textContent = 'API доступен. Работа в онлайн-режиме';
      } else {
        statusElement.classList.remove('online');
        statusElement.classList.add('offline');
        statusElement.querySelector('span').textContent = 'API недоступен. Работа в офлайн-режиме';
      }
    }
    
    // Обновляем футер
    const offlineNote = document.querySelector('.offline-note');
    if (offlineNote) {
      if (!this.isOnline) {
        offlineNote.style.display = 'block';
      } else {
        offlineNote.style.display = 'none';
      }
    }
  },
  
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkStatus();
    });
  },
  
  getMovies() {
    if (this.fallbackData && this.fallbackData.movies) {
      return this.fallbackData.movies;
    }
    return this.getDefaultFallbackData().movies;
  }
};