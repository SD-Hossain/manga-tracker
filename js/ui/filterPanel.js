// js/ui/filterPanel.js

import { store } from "../state/store.js";
import { renderLibraryView } from "./libraryView.js";

/**
 * Initialize tag filter panel
 */
export function initTagFilterPanel() {
  const container = document.getElementById("tagFilterPanel");
  if (!container) return;

  renderTags(container);
}

/**
 * Render all tag filters
 */
function renderTags(container) {
  container.innerHTML = "";

  if (!store.tags || store.tags.length === 0) {
    container.innerHTML = `<div class="empty-state">No tags</div>`;
    return;
  }

  store.tags.forEach(tag => {
    const tagEl = document.createElement("div");
    tagEl.className = "tag-filter";
    tagEl.textContent = tag.name;
    tagEl.style.borderColor = tag.color;
    tagEl.style.color = tag.color;

    if (store.filters.tags.includes(tag.id)) {
      tagEl.classList.add("active");
      tagEl.style.backgroundColor = tag.color;
      tagEl.style.color = "#fff";
    }

    tagEl.addEventListener("click", () => {
      toggleTag(tag.id);
      renderTags(container);
      renderLibraryView();
    });

    container.appendChild(tagEl);
  });
}

/**
 * Toggle tag in active filters
 */
function toggleTag(tagId) {
  const index = store.filters.tags.indexOf(tagId);

  if (index === -1) {
    store.filters.tags.push(tagId);
  } else {
    store.filters.tags.splice(index, 1);
  }
}
