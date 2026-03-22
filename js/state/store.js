// js/state/store.js

export const store = {
  // Auth
  user: null,
  isAuthenticated: false,

  // Data
  library: [],          // full library from backend
  filteredLibrary: [],  // derived after filters
  tags: [],             // all user tags

  // Active filters
  filters: {
    search: "",
    tags: [],     // array of tag IDs
    genres: []    // array of genre names
  },

  // UI state
  currentView: "library", // 'library' | 'details'
  currentProgressId: null
};
