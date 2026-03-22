// js/ui/libraryView.js

import { store } from "../state/store.js";
import { MangaCard } from "../components/MangaCard.js";
import { applyFilters } from "../state/filters.js";
import { loadLibrary } from "../api/library.js";

/* ===============================
   PAGINATION STATE
=============================== */

let currentPage = 1;
// restore page from router (back button)
if (window.__pageRestore) {
  currentPage = window.__pageRestore;
  delete window.__pageRestore;
}
// load ONLY once
const savedPage = parseInt(localStorage.getItem("currentPage"));
if (savedPage) {
  currentPage = savedPage;
}
const ITEMS_PER_PAGE = 20;

/* ===============================
   MAIN RENDER
=============================== */
if (currentPage < 1) currentPage = 1;



export async function renderLibraryView() {
  
  const root = document.getElementById("app");
  root.innerHTML = `<div class="loading">Loading...</div>`;

  // 🔥 ALWAYS refresh latest data
store.library = await loadLibrary();

  // SHOW filters + stats again
const filters = document.querySelector(".filters");
const stats = document.querySelector(".stats");

if (filters) filters.style.display = "";
if (stats) stats.style.display = "";
  // SHOW library UI again


root.innerHTML = `
  <div id="library"></div>
`;

const container = document.getElementById("library");
  setupFilterToggles();

  if (!container) return;

  // Apply filters
  const filtered = applyFilters(
    store.library || [],
    store.filters || {}
  );

  store.filteredLibrary = filtered;
  // ONLY reset when filters actually change (not on first load)
if (store.filteredLibraryLength !== undefined &&
    filtered.length !== store.filteredLibraryLength) {

  currentPage = 1;
  localStorage.setItem("currentPage", 1);
}

store.filteredLibraryLength = filtered.length;

  // Reset page if needed
 const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
 if (currentPage > totalPages) {
  currentPage = 1;
  localStorage.setItem("currentPage", 1); // ✅ ADD THIS
}
  container.innerHTML = "";

  // Empty state
  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No manga found</h3>
        <p>Try adjusting filters or adding new manga.</p>
      </div>
    `;
    updateStats(0, 0);
    removePagination();
    return;
  }

  /* ===============================
     PAGINATION LOGIC
  =============================== */

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, end);

  const fragment = document.createDocumentFragment();
  let totalReadChapters = 0;

  paginated.forEach(item => {
    totalReadChapters += item.last_chapter || 0;

    const card = MangaCard(item);

    // NEW CHAPTER BADGE
    if (item.latest_chapter && item.latest_chapter > item.last_chapter) {
      const diff = item.latest_chapter - item.last_chapter;

      const badge = document.createElement("div");
      badge.className = "update-badge";
      badge.innerHTML = `
        <span class="badge-new">NEW</span>
        <span class="badge-count">+${diff}</span>
      `;

      card.classList.add("has-update");
      card.appendChild(badge);
    }

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  updateStats(filtered.length, totalReadChapters);
  renderPagination(filtered.length);
}

/* ===============================
   FILTER TOGGLES
=============================== */

function setupFilterToggles() {
  const genreBtn = document.getElementById("toggleGenres");
  const tagBtn = document.getElementById("toggleTags");

  const genreBox = document.getElementById("genreFilters");
  const tagBox = document.getElementById("tagFilters");

  if (genreBtn && genreBox) {
    genreBtn.onclick = () => {
      genreBox.classList.toggle("hidden");

      genreBtn.textContent = genreBox.classList.contains("hidden")
        ? "Genres ▼"
        : "Genres ▲";
    };
  }

  if (tagBtn && tagBox) {
    tagBtn.onclick = () => {
      tagBox.classList.toggle("hidden");

      tagBtn.textContent = tagBox.classList.contains("hidden")
        ? "Tags ▼"
        : "Tags ▲";
    };
  }
}

/* ===============================
   PAGINATION UI
=============================== */

function renderPagination(totalItems) {
  let container = document.getElementById("pagination");

  if (!container) {
    container = document.createElement("div");
    container.id = "pagination";
    container.className = "pagination";
    document.getElementById("app").appendChild(container);
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  let pagesHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    pagesHTML += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  container.innerHTML = `
    <button ${currentPage === 1 ? "disabled" : ""} id="prevPage">Prev</button>
    ${pagesHTML}
    <button ${currentPage === totalPages ? "disabled" : ""} id="nextPage">Next</button>
  `;

  // Page buttons
  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.onclick = () => {
      currentPage = parseInt(btn.dataset.page);
      localStorage.setItem("currentPage", currentPage);
      renderLibraryView();
    };
  });

  // Prev
  document.getElementById("prevPage").onclick = () => {
    currentPage--;
    localStorage.setItem("currentPage", currentPage);
    renderLibraryView();
  };

  // Next
  document.getElementById("nextPage").onclick = () => {
    currentPage++;
    localStorage.setItem("currentPage", currentPage);
    renderLibraryView();
  };
}

function removePagination() {
  const container = document.getElementById("pagination");
  if (container) container.remove();
}

/* ===============================
   STATS
=============================== */

function updateStats(totalManga, totalChapters) {
  const statTotal = document.getElementById("statTotal");
  const statChapters = document.getElementById("statChapters");

  if (statTotal) statTotal.textContent = totalManga;
  if (statChapters) statChapters.textContent = totalChapters;
}