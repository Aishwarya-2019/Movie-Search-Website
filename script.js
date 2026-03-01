const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const result = document.getElementById("result");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");
const themeBtn = document.getElementById("themeBtn");
const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

let currentPage = 1;
let currentSearch = "";
let totalResults = 0;
const RESULTS_PER_PAGE = 10;

// Load theme on page load
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadSearchHistory();
});

// Search button click
searchBtn.addEventListener("click", searchMovie);

// Press Enter to search
movieInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchMovie();
  }
});

// Pagination button clicks
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    searchMovie();
  }
});

nextBtn.addEventListener("click", () => {
  const maxPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
  if (currentPage < maxPages) {
    currentPage++;
    searchMovie();
  }
});

// Dark/Light Mode Toggle
themeBtn.addEventListener("click", toggleTheme);

// Search Movie Function
async function searchMovie() {
  let movieName = movieInput.value.trim();

  if (currentPage === 1) {
    movieName = movieInput.value.trim();
    movieInput.value = "";

    if (movieName === "") {
      result.innerHTML = "<p>Please enter a movie name.</p>";
      return;
    }

    currentSearch = movieName;
    addToSearchHistory(movieName);
  }

  result.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch(
      `http://www.omdbapi.com/?i=tt3896198&apikey=6b9a7a80=${encodeURIComponent(currentSearch)}&page=${currentPage}`
    );

    const data = await response.json();

    if (data.Response === "True") {
      totalResults = parseInt(data.totalResults);
      result.innerHTML = "";

      data.Search.forEach((movie) => {
        result.innerHTML += `
          <div class="movie-card" data-id="${movie.imdbID}">
            <img src="${
              movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/150"
            }" />
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
          </div>
        `;
      });

      // Add click event to each card
      document.querySelectorAll(".movie-card").forEach((card) => {
        card.addEventListener("click", () => {
          const imdbID = card.getAttribute("data-id");
          getMovieDetails(imdbID);
        });
      });

      // Show pagination
      const maxPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
      if (maxPages > 1) {
        pagination.style.display = "flex";
        pageInfo.textContent = `Page ${currentPage} of ${maxPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === maxPages;
      } else {
        pagination.style.display = "none";
      }
    } else {
      result.innerHTML = "<p>Movie not found 😢</p>";
      pagination.style.display = "none";
    }
  } catch (error) {
    result.innerHTML = "<p>Something went wrong!</p>";
    pagination.style.display = "none";
  }
}

// Fetch Full Movie Details
async function getMovieDetails(id) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=af487a17&i=${id}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.Response === "True") {
      showModal(data);
    } else {
      alert("Details not found");
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load movie details");
  }
}
// Show Modal
function showModal(data) {
  modalBody.innerHTML = `
    <h2>${data.Title}</h2>
    <p><strong>Genre:</strong> ${data.Genre}</p>
    <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
    <p><strong>Director:</strong> ${data.Director}</p>
    <p><strong>Actors:</strong> ${data.Actors}</p>
    <p><strong>Plot:</strong> ${data.Plot}</p>
  `;

  modal.style.display = "flex";
}

// Close Modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Theme Toggle Function
function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLightMode = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
  themeBtn.textContent = isLightMode ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Load Theme from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeBtn.textContent = "☀️ Light Mode";
  } else {
    themeBtn.textContent = "🌙 Dark Mode";
  }
}

// Search History Functions
function addToSearchHistory(movieName) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  
  // Remove if already exists and add to front
  history = history.filter(item => item.toLowerCase() !== movieName.toLowerCase());
  history.unshift(movieName);
  
  // Keep only last 5 searches
  history = history.slice(0, 5);
  localStorage.setItem("searchHistory", JSON.stringify(history));
  loadSearchHistory();
}

function loadSearchHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  
  if (history.length > 0) {
    historySection.style.display = "block";
    historyList.innerHTML = "";
    
    history.forEach(item => {
      const historyItem = document.createElement("button");
      historyItem.className = "history-item";
      historyItem.textContent = item;
      historyItem.addEventListener("click", () => {
        movieInput.value = item;
        currentPage = 1;
        searchMovie();
      });
      historyList.appendChild(historyItem);
    });
  } else {
    historySection.style.display = "none";
  }

}
