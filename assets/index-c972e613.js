(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(s){if(s.ep)return;s.ep=!0;const o=i(s);fetch(s.href,o)}})();const u={init(){const e=localStorage.getItem("theme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches;e==="dark"||!e&&t?document.documentElement.setAttribute("data-theme","dark"):document.documentElement.removeAttribute("data-theme");const i=document.getElementById("theme-toggle");i&&i.addEventListener("click",()=>this.toggleTheme())},toggleTheme(){document.documentElement.getAttribute("data-theme")==="dark"?(document.documentElement.removeAttribute("data-theme"),localStorage.setItem("theme","light")):(document.documentElement.setAttribute("data-theme","dark"),localStorage.setItem("theme","dark"))}},v={init(){this.loadFavorites(),this.updateFavoritesCount(),this.setupEventListeners()},getFavorites(){const e=localStorage.getItem("movie-favorites");return e?JSON.parse(e):[]},loadFavorites(){return this.getFavorites()},isFavorite(e){return this.getFavorites().some(i=>i.imdbID===e)},addFavorite(e){const t=this.getFavorites();return t.some(i=>i.imdbID===e.imdbID)?!1:(t.push(e),localStorage.setItem("movie-favorites",JSON.stringify(t)),this.updateFavoritesCount(),!0)},removeFavorite(e){let t=this.getFavorites();return t=t.filter(i=>i.imdbID!==e),localStorage.setItem("movie-favorites",JSON.stringify(t)),this.updateFavoritesCount(),!0},updateFavoritesCount(){const e=this.getFavorites(),t=document.getElementById("favorites-count");t&&(t.textContent=e.length);const i=document.querySelector(".movie-details-actions .favorite-btn");if(i){const a=i.dataset.movieId;this.isFavorite(a)?i.classList.add("active"):i.classList.remove("active")}},setupEventListeners(){document.addEventListener("click",i=>{if(i.target.closest(".favorite-button")){i.preventDefault();const a=i.target.closest(".favorite-button"),s=a.dataset.movieId,o=a.dataset.movieTitle,r=a.dataset.moviePoster,l=a.dataset.movieRating,d={imdbID:s,Title:o,Poster:r,imdbRating:l};this.isFavorite(s)?(this.removeFavorite(s),a.classList.remove("active")):(this.addFavorite(d),a.classList.add("active"))}}),document.addEventListener("click",i=>{if(i.target.closest(".movie-details-actions .favorite-btn")){i.preventDefault();const a=i.target.closest(".movie-details-actions .favorite-btn"),s=a.dataset.movieId;if(this.isFavorite(s))this.removeFavorite(s),a.classList.remove("active");else{const o=document.querySelector(".movie-details-title").textContent,r=document.querySelector(".movie-details-poster").src,l=document.querySelector(".movie-details-rating span").textContent.replace("/10",""),d={imdbID:s,Title:o,Poster:r,imdbRating:l};this.addFavorite(d),a.classList.add("active")}}});const e=document.getElementById("favorites-link");e&&e.addEventListener("click",i=>{i.preventDefault(),this.showFavorites()});const t=document.getElementById("back-button");t&&t.addEventListener("click",i=>{i.preventDefault(),this.showSearchResults()})},showFavorites(){document.getElementById("search-results").classList.remove("active"),document.getElementById("movie-details").classList.remove("active"),document.getElementById("favorites-section").classList.add("active"),this.renderFavorites()},showSearchResults(){document.getElementById("favorites-section").classList.remove("active"),document.getElementById("movie-details").classList.remove("active"),document.getElementById("search-results").classList.add("active")},renderFavorites(){const e=document.getElementById("favorites-container"),t=this.getFavorites();if(t.length===0){e.innerHTML=`
        <div class="empty-favorites">
          <p>You haven't added any movies to favorites yet.</p>
        </div>
      `;return}e.innerHTML="",t.forEach(i=>{const a=document.createElement("div");a.className="movie-card",a.innerHTML=`
        <img 
          src="${i.Poster&&i.Poster!=="N/A"?i.Poster:"/placeholder.jpg"}" 
          alt="${i.Title}" 
          class="movie-poster"
          onerror="this.onerror=null; this.src='/placeholder.jpg';"
        >
        <div class="movie-info">
          <h3 class="movie-title">${i.Title}</h3>
          <div class="movie-meta">
            <div class="movie-rating">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${i.imdbRating&&i.imdbRating!=="N/A"?i.imdbRating:"N/A"}
            </div>
            <button class="favorite-button active" data-movie-id="${i.imdbID}" data-movie-title="${i.Title.replace(/"/g,"&quot;")}" data-movie-poster="${i.Poster&&i.Poster!=="N/A"?i.Poster:""}" data-movie-rating="${i.imdbRating&&i.imdbRating!=="N/A"?i.imdbRating:0}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      `,e.appendChild(a)})}},c={isOnline:!0,fallbackData:null,init(){this.checkNetworkStatus(),this.setupEventListeners(),this.loadFallbackData()},async loadFallbackData(){try{const e=await fetch("/data/fallback.json");e.ok?this.fallbackData=await e.json():this.fallbackData=this.getDefaultFallbackData()}catch(e){console.error("Error loading fallback data:",e),this.fallbackData=this.getDefaultFallbackData()}},getDefaultFallbackData(){return{offline:!0,timestamp:Date.now(),movies:[{Title:"The Shawshank Redemption",Year:"1994",imdbID:"tt0111161",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDE2LWViOTQtOGU0YjFiNzdiNWE3Y2FmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",Plot:"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",imdbRating:"9.3",Released:"14 Oct 1994",Genre:"Drama",Director:"Frank Darabont",Writer:"Stephen King, Frank Darabont",Actors:"Tim Robbins, Morgan Freeman, Bob Gunton",Runtime:"142 min",Language:"English",Country:"USA"},{Title:"The Godfather",Year:"1972",imdbID:"tt0068646",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",Plot:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",imdbRating:"9.2",Released:"24 Mar 1972",Genre:"Crime, Drama",Director:"Francis Ford Coppola",Writer:"Mario Puzo, Francis Ford Coppola",Actors:"Marlon Brando, Al Pacino, James Caan",Runtime:"175 min",Language:"English, Italian, Latin",Country:"USA"},{Title:"The Dark Knight",Year:"2008",imdbID:"tt0468569",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",Plot:"When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",imdbRating:"9.0",Released:"18 Jul 2008",Genre:"Action, Crime, Drama",Director:"Christopher Nolan",Writer:"Jonathan Nolan, Christopher Nolan, David S. Goyer",Actors:"Christian Bale, Heath Ledger, Aaron Eckhart",Runtime:"152 min",Language:"English, Mandarin",Country:"USA, UK"},{Title:"12 Angry Men",Year:"1957",imdbID:"tt0050083",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMWU4N25jiTk1M19kLWJiM2YtY2ZjYTY3YjRlNGJjNGFiZmJjY2NlNzNkYWJhNmU0NGNjNDJmMjNlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg",Plot:"A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",imdbRating:"9.0",Released:"10 Apr 1957",Genre:"Crime, Drama",Director:"Sidney Lumet",Writer:"Reginald Rose",Actors:"Henry Fonda, Lee J. Cobb, Martin Balsam",Runtime:"96 min",Language:"English",Country:"USA"},{Title:"Schindler's List",Year:"1993",imdbID:"tt0108052",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UWMGM3NTJkXkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg",Plot:"In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",imdbRating:"9.0",Released:"4 Feb 1994",Genre:"Biography, Drama, History",Director:"Steven Spielberg",Writer:"Thomas Keneally, Steven Zaillian",Actors:"Liam Neeson, Ralph Fiennes, Ben Kingsley",Runtime:"195 min",Language:"English, Hebrew, German, Polish, Italian",Country:"USA"},{Title:"The Lord of the Rings: The Return of the King",Year:"2003",imdbID:"tt0167260",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg",Plot:"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",imdbRating:"9.0",Released:"17 Dec 2003",Genre:"Action, Adventure, Drama",Director:"Peter Jackson",Writer:"J.R.R. Tolkien, Fran Walsh",Actors:"Elijah Wood, Viggo Mortensen, Ian McKellen",Runtime:"201 min",Language:"English, Quenya, Sindarin, Black Speech",Country:"New Zealand, USA"}]}},checkNetworkStatus(){this.isOnline=navigator.onLine,this.updateNetworkStatus()},updateNetworkStatus(){const e=document.getElementById("network-status");e&&(this.isOnline?(e.classList.remove("offline"),e.classList.add("online"),e.querySelector("span").textContent="API доступен. Работа в онлайн-режиме"):(e.classList.remove("online"),e.classList.add("offline"),e.querySelector("span").textContent="API недоступен. Работа в офлайн-режиме"));const t=document.querySelector(".offline-note");t&&(this.isOnline?t.style.display="none":t.style.display="block")},setupEventListeners(){window.addEventListener("online",()=>{this.isOnline=!0,this.updateNetworkStatus()}),window.addEventListener("offline",()=>{this.isOnline=!1,this.updateNetworkStatus()})},getMovies(){return this.fallbackData&&this.fallbackData.movies?this.fallbackData.movies:this.getDefaultFallbackData().movies}},m={API_KEY:{}.VITE_OMDB_API_KEY||"YOUR_OMDB_API_KEY",BASE_URL:"https://www.omdbapi.com",async fetchFromAPI(e={}){if(!this.API_KEY||this.API_KEY==="YOUR_OMDB_API_KEY")throw console.warn("OMDb API key is not set. Please create a .env file with VITE_OMDB_API_KEY."),new Error("API key is missing. Please set up your OMDb API key.");const t=new URL(this.BASE_URL);t.search=new URLSearchParams({...e,apikey:this.API_KEY});try{const i=await fetch(t);if(!i.ok)throw new Error(`API request failed with status ${i.status}`);const a=await i.json();if(a.Response==="False")throw new Error(a.Error||"API returned an error");return a}catch(i){throw console.error("API error:",i),i}},async searchMovies(e,t=1){if(!e.trim())return{Search:[],totalResults:0,Response:"True"};try{const i=await this.fetchFromAPI({s:e,page:t,type:"movie"});return{results:i.Search||[],total_results:parseInt(i.totalResults)||0}}catch(i){throw console.error("Search error:",i),i}},async getMovieDetails(e){try{return await this.fetchFromAPI({i:e,plot:"full"})}catch(t){throw console.error("Movie details error:",t),t}},async getPopularMovies(e=1){try{return e===1?{results:[{Title:"The Shawshank Redemption",Year:"1994",imdbID:"tt0111161",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDE2LWViOTQtOGU0Yj FiNzdiNWE3Y2FmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg"},{Title:"The Godfather",Year:"1972",imdbID:"tt0068646",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"},{Title:"The Dark Knight",Year:"2008",imdbID:"tt0468569",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"},{Title:"12 Angry Men",Year:"1957",imdbID:"tt0050083",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMWU4N25jiTk1M19kLWJiM2YtY2ZjYTY3YjRlNGJjNGFiZmJjY2NlNzNkYWJhNmU0NGNjNDJmMjNlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg"},{Title:"Schindler's List",Year:"1993",imdbID:"tt0108052",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UWMGM3NTJkXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg"},{Title:"The Lord of the Rings: The Return of the King",Year:"2003",imdbID:"tt0167260",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg"}],total_results:6}:{results:[],total_results:0}}catch(t){throw console.error("Popular movies error:",t),t}}},n={showLoading(e="loading"){const t=document.getElementById(e);t&&(t.hidden=!1)},hideLoading(e="loading"){const t=document.getElementById(e);t&&(t.hidden=!0)},showError(e){const t=document.getElementById("toast");t&&(t.textContent=e,t.hidden=!1,setTimeout(()=>{t.hidden=!0},5e3))},showToast(e){const t=document.getElementById("toast");t&&(t.textContent=e,t.hidden=!1,setTimeout(()=>{t.hidden=!0},3e3))},sortMovies(e,t){if(!e||e.length===0)return e;switch(t){case"year":return[...e].sort((i,a)=>parseInt(a.Year||0)-parseInt(i.Year||0));case"rating":return[...e].sort((i,a)=>parseFloat(a.imdbRating||0)-parseFloat(i.imdbRating||0)).reverse();default:return e}},renderMovies(e,t="results-container"){const i=document.getElementById(t);if(i){if(i.innerHTML="",!e||e.length===0){i.innerHTML=`
        <div class="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="10" y1="9" x2="10" y2="13"></line>
            <line x1="14" y1="9" x2="14" y2="13"></line>
            <line x1="12" y1="17" x2="12" y2="17"></line>
          </svg>
          <p>Фильмы не найдены. Попробуйте другой запрос.</p>
        </div>
      `;return}e.forEach(a=>{const s=document.createElement("div");s.className="movie-card",s.innerHTML=`
        <div class="movie-card-inner">
          <div class="movie-poster-container">
            <img 
              src="${a.Poster&&a.Poster!=="N/A"?a.Poster:"/placeholder.jpg"}" 
              alt="${a.Title} (${a.Year})" 
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
              <h3 class="movie-title">${a.Title}</h3>
              <span class="movie-year">(${a.Year})</span>
            </div>
            <p class="movie-type">${a.Type}</p>
            <div class="movie-meta">
              <div class="movie-rating">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ${a.imdbRating&&a.imdbRating!=="N/A"?a.imdbRating:"N/A"}
              </div>
              <button class="favorite-button ${FavoritesManager.isFavorite(a.imdbID)?"active":""}" 
                      data-movie-id="${a.imdbID}" 
                      data-movie-title="${a.Title.replace(/"/g,"&quot;")}"
                      data-movie-poster="${a.Poster&&a.Poster!=="N/A"?a.Poster:""}"
                      data-movie-rating="${a.imdbRating&&a.imdbRating!=="N/A"?a.imdbRating:0}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(a.imdbID)?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="sr-only">${FavoritesManager.isFavorite(a.imdbID)?"Убрать из избранного":"Добавить в избранное"}</span>
              </button>
            </div>
          </div>
        </div>
      `,s.querySelector(".details-button").addEventListener("click",o=>{o.stopPropagation(),this.showMovieDetails(a.imdbID)}),s.addEventListener("click",o=>{o.target.closest(".favorite-button")||this.showMovieDetails(a.imdbID)}),i.appendChild(s)})}},renderMovieDetails(e){const t=document.getElementById("movie-details-container");if(!t)return;const i=s=>!s||s==="N/A"?"N/A":s,a=e.Genre&&e.Genre!=="N/A"?e.Genre:"N/A";t.innerHTML=`
      <div class="movie-details-header">
        <img 
          src="${e.Poster&&e.Poster!=="N/A"?e.Poster:"/placeholder.jpg"}" 
          alt="${e.Title}" 
          class="movie-details-poster"
          onerror="this.onerror=null; this.src='/placeholder.jpg';"
        >
        <div class="movie-details-info">
          <h1 class="movie-details-title">${e.Title} <span class="movie-details-year">(${e.Year})</span></h1>
          <div class="movie-details-meta">
            <span class="movie-details-released">${i(e.Released)}</span>
            <span class="movie-details-genre">${a}</span>
            <div class="movie-details-rating">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${e.imdbRating&&e.imdbRating!=="N/A"?e.imdbRating:"N/A"}/10</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="movie-details-content">
        <div class="movie-details-overview">
          <h2>Описание</h2>
          <p>${e.Plot||"Описание недоступно."}</p>
        </div>
        
        <div class="movie-details-meta-info">
          <div class="meta-row">
            <span class="meta-label">Режиссер:</span>
            <span class="meta-value">${e.Director||"N/A"}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Сценарий:</span>
            <span class="meta-value">${e.Writer||"N/A"}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">В ролях:</span>
            <span class="meta-value">${e.Actors||"N/A"}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Продолжительность:</span>
            <span class="meta-value">${e.Runtime||"N/A"}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Страна:</span>
            <span class="meta-value">${e.Country||"N/A"}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Язык:</span>
            <span class="meta-value">${e.Language||"N/A"}</span>
          </div>
        </div>
        
        <div class="movie-details-actions">
          <button class="favorite-btn ${FavoritesManager.isFavorite(e.imdbID)?"active":""}" 
                  data-movie-id="${e.imdbID}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(e.imdbID)?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            ${FavoritesManager.isFavorite(e.imdbID)?"Убрать из избранного":"Добавить в избранное"}
          </button>
          ${e.Website&&e.Website!=="N/A"?`
          <a href="${e.Website}" target="_blank" rel="noopener" class="details-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            Официальный сайт
          </a>
          `:""}
        </div>
      </div>
    `,document.getElementById("search-results").classList.remove("active"),document.getElementById("favorites-section").classList.remove("active"),document.getElementById("movie-details").classList.add("active"),document.getElementById("movie-details").hidden=!1},async showMovieDetails(e){try{if(this.showLoading(),OfflineManager.isOnline){const t=await API.getMovieDetails(e);this.renderMovieDetails(t)}else{const t=OfflineManager.getMovies().find(i=>i.imdbID===e);t?this.renderMovieDetails(t):this.showError("Детали фильма недоступны в офлайн-режиме")}}catch(t){this.showError("Не удалось загрузить детали фильма"),console.error("Error loading movie details:",t)}finally{this.hideLoading()}},renderSkeletons(e=6){const t=document.getElementById("results-container");if(t){t.innerHTML="";for(let i=0;i<e;i++){const a=document.createElement("div");a.className="movie-card skeleton",a.innerHTML=`
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
      `,t.appendChild(a)}}}};document.addEventListener("DOMContentLoaded",()=>{u.init(),c.init(),v.init();const e=document.getElementById("search-input"),t=document.getElementById("search-button");let i=null;const a=async()=>{const o=e.value.trim();if(!o){try{n.showLoading();const r=await m.getPopularMovies();n.renderMovies(r.results)}catch(r){console.error("Error fetching popular movies:",r);try{const l=c.getMovies();n.renderMovies(l),n.showError("Using offline data. Some features may be limited.")}catch{n.showError("Failed to load movies. Please check your connection.")}}finally{n.hideLoading()}return}try{if(n.showLoading(),c.isOnline){const r=await m.searchMovies(o);n.renderMovies(r.results)}else{const l=c.getMovies().filter(d=>d.Title.toLowerCase().includes(o.toLowerCase()));n.renderMovies(l)}}catch(r){console.error("Search error:",r),n.showError("Search failed. Please try again.");try{const d=c.getMovies().filter(h=>h.Title.toLowerCase().includes(o.toLowerCase()));n.renderMovies(d),n.showError("Using offline data for search. Results may be limited.")}catch(l){console.error("Offline search failed:",l)}}finally{n.hideLoading()}},s=()=>{clearTimeout(i),i=setTimeout(a,300)};e&&e.addEventListener("input",s),t&&t.addEventListener("click",a),e&&e.addEventListener("keypress",o=>{o.key==="Enter"&&a()}),n.renderSkeletons(),a()});
