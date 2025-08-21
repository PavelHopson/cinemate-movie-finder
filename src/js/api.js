// Работа с OMDb API
export const API = {
  // Получаем API ключ из переменной окружения
  API_KEY: import.meta.env.VITE_OMDB_API_KEY || 'YOUR_OMDB_API_KEY',
  BASE_URL: 'https://www.omdbapi.com',
  
  async fetchFromAPI(params = {}) {
    // Проверяем, установлен ли API ключ
    if (!this.API_KEY || this.API_KEY === 'YOUR_OMDB_API_KEY') {
      console.warn('OMDb API key is not set. Please create a .env file with VITE_OMDB_API_KEY.');
      throw new Error('API key is missing. Please set up your OMDb API key.');
    }
    
    const url = new URL(this.BASE_URL);
    url.search = new URLSearchParams({
      ...params,
      apikey: this.API_KEY
    });
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Проверяем, есть ли ошибка в ответе от OMDb
      if (data.Response === "False") {
        throw new Error(data.Error || "API returned an error");
      }
      
      return data;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  },
  
  async searchMovies(query, page = 1) {
    if (!query.trim()) return { Search: [], totalResults: 0, Response: "True" };
    
    try {
      const data = await this.fetchFromAPI({
        s: query,
        page: page,
        type: 'movie'
      });
      
      // OMDb возвращает результаты в поле Search
      return {
        results: data.Search || [],
        total_results: parseInt(data.totalResults) || 0
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },
  
  async getMovieDetails(imdbID) {
    try {
      const data = await this.fetchFromAPI({
        i: imdbID,
        plot: 'full'
      });
      return data;
    } catch (error) {
      console.error('Movie details error:', error);
      throw error;
    }
  },
  
  async getPopularMovies(page = 1) {
    try {
      // OMDb не имеет метода для получения популярных фильмов, поэтому используем поиск по пустому запросу
      // или получаем популярные фильмы из fallback данных
      if (page === 1) {
        return {
          results: [
            { Title: "The Shawshank Redemption", Year: "1994", imdbID: "tt0111161", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDE2LWViOTQtOGU0Yj FiNzdiNWE3Y2FmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg" },
            { Title: "The Godfather", Year: "1972", imdbID: "tt0068646", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg" },
            { Title: "The Dark Knight", Year: "2008", imdbID: "tt0468569", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg" },
            { Title: "12 Angry Men", Year: "1957", imdbID: "tt0050083", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMWU4N25jiTk1M19kLWJiM2YtY2ZjYTY3YjRlNGJjNGFiZmJjY2NlNzNkYWJhNmU0NGNjNDJmMjNlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg" },
            { Title: "Schindler's List", Year: "1993", imdbID: "tt0108052", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UWMGM3NTJkXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg" },
            { Title: "The Lord of the Rings: The Return of the King", Year: "2003", imdbID: "tt0167260", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg" }
          ],
          total_results: 6
        };
      } else {
        return { results: [], total_results: 0 };
      }
    } catch (error) {
      console.error('Popular movies error:', error);
      throw error;
    }
  }
};