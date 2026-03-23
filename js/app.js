// js/app.js

import { store } from "./state/store.js";

import { initAuth } from "./auth/kinde.js";
import { login, logout } from "./auth/kinde.js";


import { loadLibrary } from "./api/library.js";
import { fetchTags } from "./api/tags.js";

import { renderLibraryView } from "./ui/libraryView.js";
import { renderDetailsView } from "./ui/detailsView.js";

import { openTagManager } from "./ui/tagManager.js";
import { initFilters } from "./ui/filterView.js";
import { openAddMangaModal } from "./ui/addMangaModal.js";



// ===============================
// App Bootstrap
// ===============================
async function initApp() {
  try {
    const loginView = document.getElementById("loginView");
    const appView = document.getElementById("appView");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const manageTagsBtn = document.getElementById("manageTagsBtn");
    const addMangaBtn = document.getElementById("addMangaBtn");

    const authResult = await initAuth();

    store.isAuthenticated = authResult.isAuthenticated;
    store.user = authResult.user;

    // ===============================
    // NOT AUTHENTICATED
    // ===============================
    if (!store.isAuthenticated) {
      loginView.classList.remove("hidden");
      appView.classList.add("hidden");

      if (loginBtn) {
        loginBtn.onclick = async () => {
          await login();
        };
      }

      return;
    }

    // ===============================
    // AUTHENTICATED
    // ===============================
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");

    // Header Buttons
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await logout();
        localStorage.clear();
        location.reload();
      };
    }

    if (manageTagsBtn) {
      manageTagsBtn.onclick = () => openTagManager();
    }

    if (addMangaBtn) {
      addMangaBtn.onclick = () => openAddMangaModal();
    }

    // Load data
    store.library = await loadLibrary();
    store.filteredLibrary = store.library;
    store.tags = await fetchTags();

    // Initialize filters
    initFilters();

    // Routing
    await handleRoute();
    window.addEventListener("popstate", handleRoute);

  } catch (err) {
    console.error("App initialization failed:", err);
  }
}

/* ===============================
   Router
=============================== */
export async function handleRoute() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  const id = params.get("id");

  if (view === "manga" && id) {
    renderDetailsView(id);
  } else {
   await renderLibraryView();
  }
}
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navMenu");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
}
/* ===============================
   Start App
=============================== */
initApp();
