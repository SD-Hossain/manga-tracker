// js/ui/searchBar.js

import { store } from "../state/store.js";
import { renderLibraryView } from "./libraryView.js";

/**
 * Initialize search bar behavior
 */
export function initSearchBar() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    store.filters.search = input.value;
    renderLibraryView();
  });
}
