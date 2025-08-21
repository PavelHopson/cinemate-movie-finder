(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();const E={init(){document.documentElement.style.setProperty("--primary-color-rgb","99, 102, 241"),document.documentElement.style.setProperty("--error-color-rgb","239, 68, 68");const e=localStorage.getItem("theme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches;e==="dark"||!e&&t?(document.documentElement.setAttribute("data-theme","dark"),this.updateThemeIcons("dark")):(document.documentElement.removeAttribute("data-theme"),this.updateThemeIcons("light"));const s=document.getElementById("theme-toggle");s&&s.addEventListener("click",()=>this.toggleTheme()),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",i=>{localStorage.getItem("theme")||(i.matches?(document.documentElement.setAttribute("data-theme","dark"),this.updateThemeIcons("dark")):(document.documentElement.removeAttribute("data-theme"),this.updateThemeIcons("light")))})},toggleTheme(){document.documentElement.getAttribute("data-theme")==="dark"?(document.documentElement.removeAttribute("data-theme"),localStorage.setItem("theme","light"),this.updateThemeIcons("light")):(document.documentElement.setAttribute("data-theme","dark"),localStorage.setItem("theme","dark"),this.updateThemeIcons("dark"))},updateThemeIcons(e){const t=document.querySelectorAll(".sun-icon"),s=document.querySelectorAll(".moon-icon");e==="dark"?(t.forEach(a=>a.style.display="none"),s.forEach(a=>a.style.display="block")):(t.forEach(a=>a.style.display="block"),s.forEach(a=>a.style.display="none")),document.querySelectorAll(".theme-icon").forEach(a=>a.style.display="block")}},f={init(){this.loadFavorites(),this.updateFavoritesCount(),this.setupEventListeners()},getFavorites(){const e=localStorage.getItem("movie-favorites");return e?JSON.parse(e):[]},loadFavorites(){return this.getFavorites()},isFavorite(e){return this.getFavorites().some(s=>s.imdbID===e)},addFavorite(e){const t=this.getFavorites();return t.some(s=>s.imdbID===e.imdbID)?!1:(t.push(e),localStorage.setItem("movie-favorites",JSON.stringify(t)),this.updateFavoritesCount(),!0)},removeFavorite(e){let t=this.getFavorites();return t=t.filter(s=>s.imdbID!==e),localStorage.setItem("movie-favorites",JSON.stringify(t)),this.updateFavoritesCount(),!0},updateFavoritesCount(){const e=this.getFavorites(),t=document.getElementById("favorites-count");t&&(t.textContent=e.length);const s=document.querySelector(".movie-details-actions .favorite-btn");if(s){const i=s.dataset.movieId;this.isFavorite(i)?s.classList.add("active"):s.classList.remove("active")}},setupEventListeners(){document.addEventListener("click",s=>{if(s.target.closest(".favorite-button")){s.preventDefault();const i=s.target.closest(".favorite-button"),a=i.dataset.movieId,o=i.dataset.movieTitle,d=i.dataset.moviePoster,v=i.dataset.movieRating,u={imdbID:a,Title:o,Poster:d,imdbRating:v};this.isFavorite(a)?(this.removeFavorite(a),i.classList.remove("active")):(this.addFavorite(u),i.classList.add("active"))}}),document.addEventListener("click",s=>{if(s.target.closest(".movie-details-actions .favorite-btn")){s.preventDefault();const i=s.target.closest(".movie-details-actions .favorite-btn"),a=i.dataset.movieId;if(this.isFavorite(a))this.removeFavorite(a),i.classList.remove("active");else{const o=document.querySelector(".movie-details-title").textContent,d=document.querySelector(".movie-details-poster").src,v=document.querySelector(".movie-details-rating span").textContent.replace("/10",""),u={imdbID:a,Title:o,Poster:d,imdbRating:v};this.addFavorite(u),i.classList.add("active")}}});const e=document.getElementById("favorites-link");e&&e.addEventListener("click",s=>{s.preventDefault(),this.showFavorites()});const t=document.getElementById("back-button");t&&t.addEventListener("click",s=>{s.preventDefault(),this.showSearchResults()})},showFavorites(){document.getElementById("search-results").classList.remove("active"),document.getElementById("movie-details").classList.remove("active"),document.getElementById("favorites-section").classList.add("active"),this.renderFavorites()},showSearchResults(){document.getElementById("favorites-section").classList.remove("active"),document.getElementById("movie-details").classList.remove("active"),document.getElementById("search-results").classList.add("active")},renderFavorites(){const e=document.getElementById("favorites-container"),t=this.getFavorites();if(t.length===0){e.innerHTML=`
        <div class="empty-favorites">
          <p>You haven't added any movies to favorites yet.</p>
        </div>
      `;return}e.innerHTML="",t.forEach(s=>{const i=document.createElement("div");i.className="movie-card",i.innerHTML=`
        <img 
          src="${s.Poster&&s.Poster!=="N/A"?s.Poster:"/placeholder.jpg"}" 
          alt="${s.Title}" 
          class="movie-poster"
          onerror="this.onerror=null; this.src='/placeholder.jpg';"
        >
        <div class="movie-info">
          <h3 class="movie-title">${s.Title}</h3>
          <div class="movie-meta">
            <div class="movie-rating">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${s.imdbRating&&s.imdbRating!=="N/A"?s.imdbRating:"N/A"}
            </div>
            <button class="favorite-button active" data-movie-id="${s.imdbID}" data-movie-title="${s.Title.replace(/"/g,"&quot;")}" data-movie-poster="${s.Poster&&s.Poster!=="N/A"?s.Poster:""}" data-movie-rating="${s.imdbRating&&s.imdbRating!=="N/A"?s.imdbRating:0}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      `,e.appendChild(i)})}},p={isOnline:!0,fallbackData:null,init(){this.checkNetworkStatus(),this.setupEventListeners(),this.loadFallbackData()},async loadFallbackData(){try{const e=await fetch("/data/fallback.json");e.ok?this.fallbackData=await e.json():this.fallbackData=this.getDefaultFallbackData()}catch(e){console.error("Error loading fallback data:",e),this.fallbackData=this.getDefaultFallbackData()}},getDefaultFallbackData(){return{offline:!0,timestamp:Date.now(),movies:[{Title:"The Shawshank Redemption",Year:"1994",imdbID:"tt0111161",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDE2LWViOTQtOGU0YjFiNzdiNWE3Y2FmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",Plot:"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",imdbRating:"9.3",Released:"14 Oct 1994",Genre:"Drama",Director:"Frank Darabont",Writer:"Stephen King, Frank Darabont",Actors:"Tim Robbins, Morgan Freeman, Bob Gunton",Runtime:"142 min",Language:"English",Country:"USA"},{Title:"The Godfather",Year:"1972",imdbID:"tt0068646",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",Plot:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",imdbRating:"9.2",Released:"24 Mar 1972",Genre:"Crime, Drama",Director:"Francis Ford Coppola",Writer:"Mario Puzo, Francis Ford Coppola",Actors:"Marlon Brando, Al Pacino, James Caan",Runtime:"175 min",Language:"English, Italian, Latin",Country:"USA"},{Title:"The Dark Knight",Year:"2008",imdbID:"tt0468569",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",Plot:"When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",imdbRating:"9.0",Released:"18 Jul 2008",Genre:"Action, Crime, Drama",Director:"Christopher Nolan",Writer:"Jonathan Nolan, Christopher Nolan, David S. Goyer",Actors:"Christian Bale, Heath Ledger, Aaron Eckhart",Runtime:"152 min",Language:"English, Mandarin",Country:"USA, UK"},{Title:"12 Angry Men",Year:"1957",imdbID:"tt0050083",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMWU4N25jiTk1M19kLWJiM2YtY2ZjYTY3YjRlNGJjNGFiZmJjY2NlNzNkYWJhNmU0NGNjNDJmMjNlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg",Plot:"A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",imdbRating:"9.0",Released:"10 Apr 1957",Genre:"Crime, Drama",Director:"Sidney Lumet",Writer:"Reginald Rose",Actors:"Henry Fonda, Lee J. Cobb, Martin Balsam",Runtime:"96 min",Language:"English",Country:"USA"},{Title:"Schindler's List",Year:"1993",imdbID:"tt0108052",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UWMGM3NTJkXkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg",Plot:"In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",imdbRating:"9.0",Released:"4 Feb 1994",Genre:"Biography, Drama, History",Director:"Steven Spielberg",Writer:"Thomas Keneally, Steven Zaillian",Actors:"Liam Neeson, Ralph Fiennes, Ben Kingsley",Runtime:"195 min",Language:"English, Hebrew, German, Polish, Italian",Country:"USA"},{Title:"The Lord of the Rings: The Return of the King",Year:"2003",imdbID:"tt0167260",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg",Plot:"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",imdbRating:"9.0",Released:"17 Dec 2003",Genre:"Action, Adventure, Drama",Director:"Peter Jackson",Writer:"J.R.R. Tolkien, Fran Walsh",Actors:"Elijah Wood, Viggo Mortensen, Ian McKellen",Runtime:"201 min",Language:"English, Quenya, Sindarin, Black Speech",Country:"New Zealand, USA"}]}},checkNetworkStatus(){this.isOnline=navigator.onLine,this.updateNetworkStatus()},updateNetworkStatus(){const e=document.getElementById("network-status");e&&(this.isOnline?(e.classList.remove("offline"),e.classList.add("online"),e.querySelector("span").textContent="API доступен. Работа в онлайн-режиме"):(e.classList.remove("online"),e.classList.add("offline"),e.querySelector("span").textContent="API недоступен. Работа в офлайн-режиме"));const t=document.querySelector(".offline-note");t&&(this.isOnline?t.style.display="none":t.style.display="block")},setupEventListeners(){window.addEventListener("online",()=>{this.isOnline=!0,this.updateNetworkStatus()}),window.addEventListener("offline",()=>{this.isOnline=!1,this.updateNetworkStatus()})},getMovies(){return this.fallbackData&&this.fallbackData.movies?this.fallbackData.movies:this.getDefaultFallbackData().movies}},w={API_KEY:"YOUR_OMDB_API_KEY",BASE_URL:"https://www.omdbapi.com",async fetchFromAPI(e={}){if(!this.API_KEY||this.API_KEY==="YOUR_OMDB_API_KEY")throw console.warn("OMDb API key is not set. Please create a .env file with VITE_OMDB_API_KEY."),new Error("API key is missing. Please set up your OMDb API key.");const t=new URL(this.BASE_URL);t.search=new URLSearchParams({...e,apikey:this.API_KEY});try{const s=await fetch(t);if(!s.ok)throw new Error(`API request failed with status ${s.status}`);const i=await s.json();if(i.Response==="False")throw new Error(i.Error||"API returned an error");return i}catch(s){throw console.error("API error:",s),s}},async searchMovies(e,t=1){if(!e.trim())return{Search:[],totalResults:0,Response:"True"};try{const s=await this.fetchFromAPI({s:e,page:t,type:"movie"});return{results:s.Search||[],total_results:parseInt(s.totalResults)||0}}catch(s){throw console.error("Search error:",s),s}},async getMovieDetails(e){try{return await this.fetchFromAPI({i:e,plot:"full"})}catch(t){throw console.error("Movie details error:",t),t}},async getPopularMovies(e=1){try{return e===1?{results:[{Title:"The Shawshank Redemption",Year:"1994",imdbID:"tt0111161",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDE2LWViOTQtOGU0Yj FiNzdiNWE3Y2FmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg"},{Title:"The Godfather",Year:"1972",imdbID:"tt0068646",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"},{Title:"The Dark Knight",Year:"2008",imdbID:"tt0468569",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"},{Title:"12 Angry Men",Year:"1957",imdbID:"tt0050083",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BMWU4N25jiTk1M19kLWJiM2YtY2ZjYTY3YjRlNGJjNGFiZmJjY2NlNzNkYWJhNmU0NGNjNDJmMjNlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg"},{Title:"Schindler's List",Year:"1993",imdbID:"tt0108052",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UWMGM3NTJkXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg"},{Title:"The Lord of the Rings: The Return of the King",Year:"2003",imdbID:"tt0167260",Type:"movie",Poster:"https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQX5BNzkwMTM5MTE2.jpg"}],total_results:6}:{results:[],total_results:0}}catch(t){throw console.error("Popular movies error:",t),t}}},r={showLoading(e="loading"){const t=document.getElementById(e);t&&(t.hidden=!1)},hideLoading(e="loading"){const t=document.getElementById(e);t&&(t.hidden=!0)},showError(e){const t=document.getElementById("toast");t&&(t.textContent=e,t.hidden=!1,setTimeout(()=>{t.hidden=!0},5e3))},showToast(e){const t=document.getElementById("toast");t&&(t.textContent=e,t.hidden=!1,setTimeout(()=>{t.hidden=!0},3e3))},sortMovies(e,t){if(!e||e.length===0)return e;switch(t){case"year":return[...e].sort((s,i)=>parseInt(i.Year||0)-parseInt(s.Year||0));case"rating":return[...e].sort((s,i)=>parseFloat(i.imdbRating||0)-parseFloat(s.imdbRating||0)).reverse();default:return e}},renderMovies(e,t="results-container"){const s=document.getElementById(t);if(s){if(s.innerHTML="",!e||e.length===0){s.innerHTML=`
        <div class="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="10" y1="9" x2="10" y2="13"></line>
            <line x1="14" y1="9" x2="14" y2="13"></line>
            <line x1="12" y1="17" x2="12" y2="17"></line>
          </svg>
          <p>Фильмы не найдены. Попробуйте другой запрос.</p>
        </div>
      `;return}e.forEach(i=>{const a=document.createElement("div");a.className="movie-card",a.innerHTML=`
        <div class="movie-card-inner">
          <div class="movie-poster-container">
            <img 
              src="${i.Poster&&i.Poster!=="N/A"?i.Poster:"/placeholder.jpg"}" 
              alt="${i.Title} (${i.Year})" 
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
              <h3 class="movie-title">${i.Title}</h3>
              <span class="movie-year">(${i.Year})</span>
            </div>
            <p class="movie-type">${i.Type}</p>
            <div class="movie-meta">
              <div class="movie-rating">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ${i.imdbRating&&i.imdbRating!=="N/A"?i.imdbRating:"N/A"}
              </div>
              <button class="favorite-button ${FavoritesManager.isFavorite(i.imdbID)?"active":""}" 
                      data-movie-id="${i.imdbID}" 
                      data-movie-title="${i.Title.replace(/"/g,"&quot;")}"
                      data-movie-poster="${i.Poster&&i.Poster!=="N/A"?i.Poster:""}"
                      data-movie-rating="${i.imdbRating&&i.imdbRating!=="N/A"?i.imdbRating:0}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${FavoritesManager.isFavorite(i.imdbID)?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="sr-only">${FavoritesManager.isFavorite(i.imdbID)?"Убрать из избранного":"Добавить в избранное"}</span>
              </button>
            </div>
          </div>
        </div>
      `,a.querySelector(".details-button").addEventListener("click",o=>{o.stopPropagation(),this.showMovieDetails(i.imdbID)}),a.addEventListener("click",o=>{o.target.closest(".favorite-button")||this.showMovieDetails(i.imdbID)}),s.appendChild(a)})}},renderMovieDetails(e){const t=document.getElementById("movie-details-container");if(!t)return;const s=a=>!a||a==="N/A"?"N/A":a,i=e.Genre&&e.Genre!=="N/A"?e.Genre:"N/A";t.innerHTML=`
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
            <span class="movie-details-released">${s(e.Released)}</span>
            <span class="movie-details-genre">${i}</span>
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
    `,document.getElementById("search-results").classList.remove("active"),document.getElementById("favorites-section").classList.remove("active"),document.getElementById("movie-details").classList.add("active"),document.getElementById("movie-details").hidden=!1},async showMovieDetails(e){try{if(this.showLoading(),OfflineManager.isOnline){const t=await API.getMovieDetails(e);this.renderMovieDetails(t)}else{const t=OfflineManager.getMovies().find(s=>s.imdbID===e);t?this.renderMovieDetails(t):this.showError("Детали фильма недоступны в офлайн-режиме")}}catch(t){this.showError("Не удалось загрузить детали фильма"),console.error("Error loading movie details:",t)}finally{this.hideLoading()}},renderSkeletons(e=6){const t=document.getElementById("results-container");if(t){t.innerHTML="";for(let s=0;s<e;s++){const i=document.createElement("div");i.className="movie-card skeleton",i.innerHTML=`
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
      `,t.appendChild(i)}}}};let h=[];document.addEventListener("DOMContentLoaded",()=>{E.init(),p.init(),f.init();const e=document.getElementById("search-input"),t=document.getElementById("search-button"),s=document.getElementById("search-clear"),i=document.getElementById("suggestions"),a=document.querySelector(".close-suggestions");let o=null;const d=async()=>{const n=e.value.trim();if(!n){i.hidden=!0;try{r.showLoading(),h=(await w.getPopularMovies()).results||[];const c=document.getElementById("sort-by")?.value||"relevance",l=r.sortMovies(h,c);r.renderMovies(l)}catch(m){console.error("Error fetching popular movies:",m);try{h=p.getMovies();const l=document.getElementById("sort-by")?.value||"relevance",g=r.sortMovies(h,l);r.renderMovies(g),r.showError("Используем офлайн-данные. Некоторые функции могут быть ограничены.")}catch{r.showError("Не удалось загрузить фильмы. Проверьте подключение.")}}finally{r.hideLoading()}return}try{if(r.showLoading(),i.hidden=!0,p.isOnline){h=(await w.searchMovies(n)).results||[];const c=document.getElementById("sort-by")?.value||"relevance",l=r.sortMovies(h,c);r.renderMovies(l)}else{h=p.getMovies().filter(M=>M.Title.toLowerCase().includes(n.toLowerCase()));const l=document.getElementById("sort-by")?.value||"relevance",g=r.sortMovies(h,l);r.renderMovies(g)}}catch(m){console.error("Search error:",m),r.showError("Поиск не удался. Попробуйте снова.");try{h=p.getMovies().filter(b=>b.Title.toLowerCase().includes(n.toLowerCase()));const g=document.getElementById("sort-by")?.value||"relevance",M=r.sortMovies(h,g);r.renderMovies(M),r.showError("Используем офлайн-данные для поиска. Результаты могут быть ограничены.")}catch(c){console.error("Offline search failed:",c)}}finally{r.hideLoading()}},v=()=>{e.value.trim()===""&&(i.hidden=!1)},u=()=>{clearTimeout(o),e.value.trim()===""?i.hidden=!1:(i.hidden=!0,o=setTimeout(d,300))};e&&(e.addEventListener("input",u),e.addEventListener("focus",v)),t&&t.addEventListener("click",d),s&&s.addEventListener("click",()=>{e.value="",i.hidden=!1,e.focus(),u()}),document.querySelectorAll(".suggestion-item").forEach(n=>{n.addEventListener("click",()=>{e.value=n.textContent,i.hidden=!0,d()})}),a&&a.addEventListener("click",()=>{i.hidden=!0}),document.querySelectorAll(".tab").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".results-section").forEach(l=>{l.classList.remove("active"),l.hidden=!0}),document.querySelectorAll(".tab").forEach(l=>{l.classList.remove("active"),l.setAttribute("aria-selected","false")});const m=n.dataset.tab,c=document.getElementById(m);c&&(c.classList.add("active"),c.hidden=!1),n.classList.add("active"),n.setAttribute("aria-selected","true"),m==="favorites-section"&&f.renderFavorites()})});const k=document.getElementById("clear-favorites");k&&k.addEventListener("click",()=>{confirm("Вы уверены, что хотите удалить все фильмы из избранного?")&&(localStorage.removeItem("movie-favorites"),f.updateFavoritesCount(),f.renderFavorites(),r.showToast("Все фильмы удалены из избранного"))});const y=document.getElementById("sort-by");y&&y.addEventListener("change",()=>{const n=y.value,m=r.sortMovies(h,n);r.renderMovies(m)}),e&&e.addEventListener("keypress",n=>{n.key==="Enter"&&d()}),r.renderSkeletons(),d()});
