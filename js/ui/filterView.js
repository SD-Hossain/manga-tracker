//js/ui/filterView.js


import { store } from "../state/store.js";
import { renderLibraryView } from "./libraryView.js";

/**
 * Initialize filter system
 */
export function initFilters() {
  initSearch();
  initStatus();
  initSort();
  renderGenreFilters();
  renderTagFilters();
}

/* ===============================
   SEARCH
================================= */
function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    store.filters.search = input.value;
    renderLibraryView();
  });
}

/* ===============================
   STATUS
================================= */
function initStatus() {
  const select = document.getElementById("statusFilter");
  if (!select) return;

  select.addEventListener("change", () => {
    store.filters.status = select.value;
    renderLibraryView();
  });
}

/* ===============================
   SORT
================================= */
function initSort() {
  const select = document.getElementById("sortFilter");
  if (!select) return;

  // 🔥 1. LOAD saved value
  const savedSort = localStorage.getItem("sortPreference");
  if (savedSort) {
    select.value = savedSort;
    store.filters.sort = savedSort; // important!
  }

  // 🔥 2. SAVE on change
  select.addEventListener("change", () => {
    const value = select.value;

    store.filters.sort = value;

    // Save to localStorage
    localStorage.setItem("sortPreference", value);

    renderLibraryView();
  });
}

/* ===============================
   GENRE FILTERS
================================= */
function renderGenreFilters() {
  const container = document.getElementById("genreFilters");
  if (!container) return;

  container.innerHTML = "";

  const allGenres = extractAllGenres();

  allGenres.forEach(genre => {
    const chip = createFilterChip(
      genre,
      store.filters.genres,
      "genres"
    );
    container.appendChild(chip);
  });
}

function extractAllGenres() {
  const set = new Set();

  store.library.forEach(item => {
    if (!item.genres) return;

    let genres = item.genres;

    if (typeof genres === "string") {
      try {
        genres = JSON.parse(genres);
      } catch {
        genres = [];
      }
    }

    if (Array.isArray(genres)) {
      genres.forEach(g => set.add(g));
    }
  });

  return Array.from(set).sort();
}

/* ===============================
   TAG FILTERS
================================= */
function renderTagFilters() {
  const container = document.getElementById("tagFilters");
  if (!container) return;

  container.innerHTML = "";

  store.tags.forEach(tag => {
    const chip = createFilterChip(
      tag.id,
      store.filters.tags,
      "tags",
      tag.name,
      tag.color
    );
    container.appendChild(chip);
  });
}

/* ===============================
   CHIP FACTORY
================================= */
function createFilterChip(value, selectedArray, type, label, color) {
  const chip = document.createElement("div");
  chip.className = "filter-chip";

  chip.textContent = label || value;

  if (color) {
    chip.style.borderColor = color;
  }

  if (selectedArray.includes(value)) {
    chip.classList.add("active");
    if (color) chip.style.backgroundColor = color;
  }

  chip.addEventListener("click", () => {
    toggleFilterValue(type, value);
    renderLibraryView();
    chip.classList.toggle("active");
  });

  return chip;
}

function toggleFilterValue(type, value) {
  const arr = store.filters[type];

  const index = arr.indexOf(value);

  if (index > -1) {
    arr.splice(index, 1);
  } else {
    arr.push(value);
  }
}
