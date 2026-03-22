// js/components/MangaCard.js

import { ChapterCounter } from "./ChapterCounter.js";
import { store } from "../state/store.js";

/**
 * Create a manga library card
 */
export function MangaCard(item) {
  const card = document.createElement("div");
  card.className = "library-card";

  // ----------------------------------
  // Card Navigation
  // ----------------------------------
  card.addEventListener("click", () => {
    history.pushState({}, "", `/?view=manga&id=${item.progress_id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  // ----------------------------------
  // Cover Section
  // ----------------------------------
  const coverWrapper = document.createElement("div");
  coverWrapper.className = "card-cover-wrapper";

  const cover = document.createElement("img");
  cover.className = "card-cover";
  cover.src =
    item.cover_url || "/assets/images/placeholder-cover.png";
  cover.alt = item.title || "Manga Cover";

  coverWrapper.appendChild(cover);

  // Status badge
  if (item.status) {
    const statusBadge = document.createElement("div");
    statusBadge.className = `status-badge status-${item.status}`;
    statusBadge.textContent = formatStatus(item.status);
    coverWrapper.appendChild(statusBadge);
  }

  // ----------------------------------
  // Content Section
  // ----------------------------------
  const content = document.createElement("div");
  content.className = "card-content";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = item.title || "Untitled";

  //...................................
  // GENRES ROWS
  //...................................

  const genreRow = document.createElement("div");
  genreRow.className = "card-genres";

  let genres = [];

  try {
    genres = typeof item.genres === "string"
        ? JSON.parse(item.genres)
            : item.genres || [];
          } catch {
            genres = [];
          }
          genres.slice(0, 3).forEach(g => {
            const chip = document.createElement("span");
            chip.className = "genre-chip";
            chip.textContent = g;
            genreRow.appendChild(chip);
          });
          
          if (genres.length > 3) {
            const more = document.createElement("span");
            more.className = "genre-more";
            more.textContent = `+${genres.length - 3}`;
            genreRow.appendChild(more);
          }
          
          if (genres.length === 0) {
            genreRow.style.display = "none";
          }
          

  // ----------------------------------
  // TAG PREVIEW SECTION
  // ----------------------------------
  const tagsPreview = document.createElement("div");
  tagsPreview.className = "card-tags-preview";

  if (Array.isArray(item.tags) && item.tags.length) {
    const tagObjects = store.tags.filter(t =>
      item.tags.includes(t.id)
    );

    tagObjects.slice(0, 3).forEach(tag => {
      const chip = document.createElement("span");
      chip.className = "card-tag-chip";
      chip.textContent = tag.name;
      chip.style.backgroundColor = tag.color;
      tagsPreview.appendChild(chip);
    });

    if (tagObjects.length > 3) {
      const more = document.createElement("span");
      more.className = "card-tag-more";
      more.textContent = `+${tagObjects.length - 3}`;
      tagsPreview.appendChild(more);
    }
  }

  // ----------------------------------
  // Footer Section
  // ----------------------------------
  const footer = document.createElement("div");
  footer.className = "card-footer";

  const counter = ChapterCounter(item);
  footer.appendChild(counter);

  const resumeBtn = document.createElement("button");
  resumeBtn.className = "resume-btn";
  resumeBtn.textContent = "Resume";

  resumeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (item.redirect_url) {
      window.open(item.redirect_url, "_blank");
    }
  });

  footer.appendChild(resumeBtn);

  // ----------------------------------
  // Assemble
  // ----------------------------------
  content.appendChild(title);
  content.appendChild(genreRow);
  content.appendChild(tagsPreview);
  content.appendChild(footer);

  card.appendChild(coverWrapper);
  card.appendChild(content);

  return card;
}

/**
 * Format status label
 */
function formatStatus(status) {
  switch (status) {
    case "reading":
      return "Reading";
    case "completed":
      return "Completed";
    case "dropped":
      return "Dropped";
    case "on_hold":
      return "On Hold";
    case "plan_to_read":
      return "Plan to Read";
    default:
      return status;
  }
}
