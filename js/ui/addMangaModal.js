// js/ui/addMangaModal.js

import { createModal } from "./modal.js";
import { saveProgress } from "../api/progress.js";
import { authFetch } from "../api/client.js";
import { loadLibrary } from "../api/library.js";
import { renderLibraryView } from "./libraryView.js";
import { store } from "../state/store.js";
import { showToast } from "../utils/toast.js";

export function openAddMangaModal() {
  let selectedPreview = null;
  let previewMatches = [];
  let previewIndex = 0;
  let debounceTimer = null;

  // ===============================
  // FORM ELEMENTS
  // ===============================

  const wrapper = document.createElement("div");
  wrapper.className = "form-stack";

  const titleInput = createInput("Title");
  const chapterInput = createInput("Chapter", "number");
  const urlInput = createInput("Redirect URL (optional)");

  const previewArea = document.createElement("div");

  wrapper.append(
    titleInput.container,
    previewArea,
    chapterInput.container,
    urlInput.container
  );

  // ===============================
  // MODAL
  // ===============================

  const modal = createModal({
    title: "Add Manga",
    content: wrapper,
    actions: [
      {
        label: "Cancel",
        variant: "btn-secondary",
        onClick: () => modal.close()
      },
      {
        label: "Add",
        variant: "btn-primary",
        onClick: handleSubmit
      }
    ]
  });

  const confirmBtn = modal.footer.querySelector(".btn-primary");

  // ===============================
  // VALIDATION
  // ===============================

  function validate() {
    const title = titleInput.input.value.trim();
    const chapter = parseInt(chapterInput.input.value);
    confirmBtn.disabled = !(title && chapter > 0);
  }

  titleInput.input.addEventListener("input", () => {
    validate();
    handlePreviewDebounce();
  });

  chapterInput.input.addEventListener("input", validate);

  urlInput.input.addEventListener("blur", autoDetectFromUrl);

  // ===============================
  // PREVIEW SYSTEM
  // ===============================

  function handlePreviewDebounce() {
    clearTimeout(debounceTimer);

    const title = titleInput.input.value.trim();
    if (!title) {
      previewArea.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchPreview(title);
    }, 500);
  }

  async function fetchPreview(title) {
    previewArea.innerHTML = `<div class="loading">Searching...</div>`;

    try {
      const res = await authFetch("/manga/preview", {
        method: "POST",
        body: JSON.stringify({ title })
      });

      previewMatches = res.matches || [];
      previewIndex = 0;

      if (!previewMatches.length) {
        previewArea.innerHTML = `<div class="empty-state">No matches found</div>`;
        return;
      }

      renderPreview();

    } catch {
      previewArea.innerHTML = `<div class="error">Preview failed</div>`;
    }
  }

  function renderPreview() {
    const data = previewMatches[previewIndex];
    previewArea.innerHTML = "";

    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");
    img.src = data.coverUrl || "";

    const info = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = data.title;

    const desc = document.createElement("p");
    desc.textContent = (data.description || "").slice(0, 120);

    const genres = document.createElement("div");
    genres.className = "preview-genres";

    (data.genres || []).forEach(g => {
      const chip = document.createElement("span");
      chip.textContent = g;
      genres.appendChild(chip);
    });

    const nav = document.createElement("div");

    const prev = createBtn("◀", () => {
      previewIndex =
        (previewIndex - 1 + previewMatches.length) % previewMatches.length;
      renderPreview();
    });

    const next = createBtn("▶", () => {
      previewIndex =
        (previewIndex + 1) % previewMatches.length;
      renderPreview();
    });

    const useBtn = createBtn("Use This", () => {
      selectedPreview = data;
      titleInput.input.value = data.title;
      previewArea.innerHTML = "";
      validate();
    }, "btn-primary");

    nav.append(prev, next);

    info.append(title, desc, genres, nav, useBtn);
    card.append(img, info);

    previewArea.appendChild(card);
  }

  // ===============================
  // SUBMIT
  // ===============================

  async function handleSubmit() {
    const title = titleInput.input.value.trim();
    const chapter = parseInt(chapterInput.input.value);

    if (!title || !chapter) return;

    confirmBtn.disabled = true;
    confirmBtn.textContent = "Adding...";

    try {
      await saveProgress({
        title,
        lastChapter: chapter,
        redirectUrl: urlInput.input.value.trim(),
        metadata: selectedPreview
      });

      store.library = await loadLibrary();
      renderLibraryView();

      showToast("Manga added!", "success");
      modal.close();

    } catch {
      showToast("Failed to add manga", "error");
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Add";
    }
  }

  // ===============================
  // URL AUTO DETECT
  // ===============================

  function autoDetectFromUrl() {
    const url = urlInput.input.value;
    if (!url) return;

    const { title, chapter } = extractFromUrl(url);

    if (title && !titleInput.input.value) {
      titleInput.input.value = title;
    }

    if (chapter && !chapterInput.input.value) {
      chapterInput.input.value = chapter;
    }

    validate();
  }
}

/* ===============================
   HELPERS
=============================== */

function createInput(labelText, type = "text") {
  const container = document.createElement("div");
  container.className = "form-group";

  const label = document.createElement("label");
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = type;

  container.append(label, input);

  return { container, input };
}

function createBtn(text, onClick, variant = "btn-secondary") {
  const btn = document.createElement("button");
  btn.className = `btn ${variant}`;
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

function extractFromUrl(url) {
  try {
    const clean = decodeURIComponent(url).toLowerCase();

    const chapterMatch =
      clean.match(/chapter[-_/ ]?(\d+)/) ||
      clean.match(/ch[-_/ ]?(\d+)/);

    const chapter = chapterMatch ? parseInt(chapterMatch[1]) : null;

    const titleMatch = clean.match(/manga\/([^\/]+)/);
    let title = null;

    if (titleMatch) {
      title = titleMatch[1]
        .replace(/-/g, " ")
        .replace(/\ball chapters\b/g, "")
        .trim();
    }

    return { title, chapter };
  } catch {
    return { title: null, chapter: null };
  }
}