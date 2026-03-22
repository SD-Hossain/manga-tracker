// js/components/ChapterCounter.js

import { updateProgress } from "../api/progress.js";

/**
 * Chapter counter component
 */
export function ChapterCounter(item, onUpdate = null) {
  let currentChapter = item.last_chapter;

  const wrapper = document.createElement("div");
  wrapper.className = "chapter-counter";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  minusBtn.className = "counter-btn";

  const value = document.createElement("span");
  value.className = "counter-value";
  value.textContent = currentChapter;

  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";
  plusBtn.className = "counter-btn";

  let isUpdating = false;

  async function changeChapter(delta) {
    if (isUpdating) return;

    const newChapter = currentChapter + delta;
    if (newChapter < 1) return;

    isUpdating = true;

    // Optimistic UI
    currentChapter = newChapter;
    value.textContent = currentChapter;

    // Build updated redirect
    const result = updateRedirectUrl(item.redirect_url, currentChapter);

const newRedirect = result.url;
const parseFailed = result.failed;

    try {
      await updateProgress(item.progress_id, {
        chapter: currentChapter,
        redirectUrl: newRedirect
      });

      // Sync local state
      item.last_chapter = currentChapter;
      item.redirect_url = newRedirect;

      // 🔥 Notify parent (important for details page)
      if (onUpdate) {
        onUpdate({
  ...item,
  parse_failed: parseFailed
});
      }

    } catch (err) {
      // Rollback
      currentChapter -= delta;
      value.textContent = currentChapter;
      console.error("Chapter update failed:", err.message);
    } finally {
      isUpdating = false;
    }
  }

  minusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    changeChapter(-1);
  });

  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    changeChapter(1);
  });

  wrapper.append(minusBtn, value, plusBtn);
  return wrapper;
}

/**
 * Update chapter number inside redirect URL
 */
function updateRedirectUrl(url, chapter) {

  if (!url) return { url, failed: true };

  const original = url;

  let updated = url
    .replace(/chapter[-_ ]?\d+/i, `chapter-${chapter}`)
    .replace(/ch[-_ ]?\d+/i, `ch-${chapter}`)
    .replace(/\/\d+\/?$/, `/${chapter}/`);

  // 🔥 Detect if nothing changed
  const failed = (updated === original);

  return { url: updated, failed };

}