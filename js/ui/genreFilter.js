// js/ui/genreFilter.js

import { store } from "../state/store.js";
import { renderLibraryView } from "./libraryView.js";

/**
 * Initialize genre filter panel
 */
export function initGenreFilterPanel() {
  const container = document.getElementById("genreFilterPanel");
  if (!container) return;

  renderGenres(container);
}

/**
 * Collect unique genres from library
 */
function getAllGenres() {
  const genreSet = new Set();

  store.library.forEach(item => {
    let genres = item.genres;
    if (!genres) return;

    if (typeof genres === "string") {
      try {
        genres = JSON.parse(genres);
      } catch {
        genres = [];
      }
    }

    genres.forEach(g => genreSet.add(g));
  });

  return Array.from(genreSet).sort();
}

/**
 * Render genre filters
 */
function renderGenres(container) {
  container.innerHTML = "";

  const genres = getAllGenres();

  if (genres.length === 0) {
    container.innerHTML = `<div class="empty-state">No genres</div>`;
    return;
  }

  genres.forEach(genre => {
    const el = document.createElement("div");
    el.className = "genre-filter";
    el.textContent = genre;

    if (store.filters.genres.includes(genre)) {
      el.classList.add("active");
    }

    el.addEventListener("click", () => {
      toggleGenre(genre);
      renderGenres(container);
      renderLibraryView();
    });

    container.appendChild(el);
  });
}

/**
 * Toggle genre in active filters
 */
function toggleGenre(genre) {
  const index = store.filters.genres.indexOf(genre);

  if (index === -1) {
    store.filters.genres.push(genre);
  } else {
    store.filters.genres.splice(index, 1);
  }
}
