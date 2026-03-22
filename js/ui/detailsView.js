// js/ui/detailsView.js

import { getProgress, deleteProgress, updateStatus } from "../api/progress.js";
import { authFetch } from "../api/client.js";
import { updateMangaTags } from "../api/tags.js";
import { refreshManga } from "../api/manga.js";
import { fetchTags } from "../api/tags.js";
import { confirmAction } from "../ui/confirm.js";
import { handleRoute } from "../app.js";


import { store } from "../state/store.js";
import { ChapterCounter } from "../components/ChapterCounter.js";

import { openEditMetadataModal } from "../modals/editMetadataModal.js";
import { openMetadataManager } from "../modals/metadataManager.js";

export async function renderDetailsView(progressId) {

  /* =========================
     HIDE LIBRARY UI
  ========================= */

    const filters = document.querySelector(".filters");
    const stats = document.querySelector(".stats");

    if (filters) filters.style.display = "none";
    if (stats) stats.style.display = "none";

  const root = document.getElementById("app");
  root.innerHTML = `<div class="loading">Loading...</div>`;

  try {

    const progress = await getProgress(progressId);
    const manga = await authFetch(`/manga/${progress.manga_id}`);
    manga.tags = (manga.tags || []).map(Number);

    root.innerHTML = "";

    const page = document.createElement("div");
page.className = "details-page";
page.id = "detailsPage"; 

    /* =========================
       TOP BAR
    ========================= */

    const topBar = document.createElement("div");
    topBar.className = "details-topbar";

    const backBtn = document.createElement("button");
    backBtn.className = "btn-secondary";
    backBtn.textContent = "← Back";

    backBtn.onclick = () => {
  history.replaceState({}, "", "?view=library");
  handleRoute(); 
};
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-danger";
    deleteBtn.textContent = "Delete Manga";

    deleteBtn.onclick = async () => {
      
      const ok = await confirmAction({
      title: "Delete Manga",
      message: "Delete this manga permanently?",
      confirmText: "Delete"
    });

if (!ok) return;

      await deleteProgress(progressId);

      history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    };

    topBar.append(backBtn, deleteBtn);

    /* =========================
       HEADER
    ========================= */
    if (!store.tags || store.tags.length === 0) {
  try {
    store.tags = await fetchTags();
  } catch (e) {
    console.error("Failed to load tags", e);
    store.tags = [];
  }
}


    const header = document.createElement("div");
    header.className = "details-header";

    const cover = document.createElement("img");
    cover.className = "details-cover";
    cover.src = manga.cover_url || "/assets/images/placeholder-cover.png";

    const info = document.createElement("div");
    info.className = "details-info";

    const title = document.createElement("h1");
    title.textContent = manga.title;

    const desc = document.createElement("p");
    desc.className = "details-description";
    desc.textContent = manga.description || "No description available.";

    const genreRow = document.createElement("div");
    genreRow.className = "details-genres";

    let genres = [];

    try {
      genres = typeof manga.genres === "string"
        ? JSON.parse(manga.genres)
        : manga.genres || [];
    } catch {
      genres = [];
    }

    genres.forEach(g => {
      const badge = document.createElement("span");
      badge.className = "genre-badge";
      badge.textContent = g;
      genreRow.appendChild(badge);
    });

    info.append(title, genreRow, desc);
    header.append(cover, info);

    /* =========================
       STATUS
    ========================= */

    const statusSection = document.createElement("div");
    statusSection.className = "details-status";

    const statusSelect = document.createElement("select");

    const statuses = [
      "reading",
      "completed",
      "dropped",
      "on_hold",
      "plan_to_read"
    ];

    statuses.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s.replace("_", " ");

      if (progress.status === s) opt.selected = true;

      statusSelect.appendChild(opt);
    });

    statusSelect.onchange = async () => {
      await updateStatus(progressId, statusSelect.value);
    };

    const statusLabel = document.createElement("span");
    statusLabel.textContent = "Status";
    statusLabel.className = "section-label";

    const statusWrapper = document.createElement("div");
    statusWrapper.className = "status-row";

    statusWrapper.append(statusSelect);

    statusSection.append(statusLabel, statusWrapper);

    /* =========================
       TAGS
    ========================= */

   /* =========================
   TAGS (CLEAN)
========================= */

const tagSection = document.createElement("div");
tagSection.className = "details-tags";

const tagLabel = document.createElement("strong");
tagLabel.textContent = "Tags";

const tagContainer = document.createElement("div");
tagContainer.className = "tag-editor";

// render once (correct)
renderTagEditor(tagContainer, progress.manga_id, manga.tags || []);

// build
tagSection.append(tagLabel, tagContainer);

    /* =========================
       PROGRESS
    ========================= */

    const progressSection = document.createElement("div");
    progressSection.className = "details-progress";

    const resumeBtn = document.createElement("button");
    resumeBtn.className = "resume-btn";
    resumeBtn.textContent = "Continue Reading";

    if (!progress.redirect_url) {

  resumeBtn.disabled = true;
  resumeBtn.style.opacity = "0.5";
  resumeBtn.style.cursor = "not-allowed";
  resumeBtn.title = "No reading link set";

} else {

  resumeBtn.onclick = () => {
    window.open(progress.redirect_url, "_blank");
  };

}

    const warning = document.createElement("div");
warning.className = "chapter-warning";
warning.textContent = "⚠ Auto chapter detection failed";

warning.style.display = "none";

const counter = ChapterCounter(
  {
    ...progress,
    progress_id: progress.progress_id ?? progress.id,
    manga_id: progress.manga_id
  },
  updated => {
    progress.redirect_url = updated.redirect_url;
    if (updated.parse_failed) {
      warning.style.display = "block";
    } else {
      warning.style.display = "none";
    }
  }
);

    const progressLabel = document.createElement("span");
    progressLabel.className = "section-label";
    progressLabel.textContent = "Progress";

    const progressRow = document.createElement("div");
    progressRow.className = "progress-row";

    progressRow.append(counter);

    const actionRow = document.createElement("div");
    actionRow.className = "progress-actions";

    actionRow.append(resumeBtn);

    progressSection.append(progressLabel, progressRow, actionRow, warning);

    /* =========================
       METADATA
    ========================= */

    const metaCard = document.createElement("div");
    metaCard.className = "details-meta-card";

    const metaTitle = document.createElement("h3");
    metaTitle.textContent = "Metadata";

    /* OTHER NAMES */

    const otherNamesContainer = document.createElement("div");
    otherNamesContainer.className = "other-names";

    const label = document.createElement("strong");
    label.textContent = "Other Names:";

    const list = document.createElement("div");
    list.className = "other-name-list";

    let otherNames = [];

    try {
      otherNames = typeof manga.other_names === "string"
        ? JSON.parse(manga.other_names)
        : manga.other_names || [];
    } catch {
      otherNames = [];
    }

    otherNames.forEach((name, index) => {

      const chip = document.createElement("span");
      chip.className = "other-name-chip";

      const text = document.createElement("span");
      text.textContent = name;

      const del = document.createElement("span");
      del.textContent = "✕";
      del.className = "delete-name";

      del.onclick = async () => {

        const ok = await confirmAction({
        title: "Remove Name",
        message: `Remove "${name}"?`,
        confirmText: "Remove"
      });

if (!ok) return;
        const updated = otherNames.filter((_, i) => i !== index);

        await authFetch(`/manga/${manga.id}`, {
          method: "PATCH",
          body: JSON.stringify({ other_names: updated })
        });

        renderDetailsView(progressId);
      };

      chip.append(text, del);
      list.appendChild(chip);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add";
    addBtn.className = "btn-secondary";

    addBtn.onclick = () => {

      if (otherNamesContainer.querySelector(".other-name-input")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "other-name-input";

      const input = document.createElement("input");
      input.placeholder = "Enter another name...";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Add";
      saveBtn.className = "btn-primary";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.className = "btn-secondary";

      saveBtn.onclick = async () => {

        const value = input.value.trim();
        if (!value) return;

        const updated = [...otherNames, value];

        await authFetch(`/manga/${manga.id}`, {
          method: "PATCH",
          body: JSON.stringify({ other_names: updated })
        });

        renderDetailsView(progressId);
      };

      cancelBtn.onclick = () => wrapper.remove();

      wrapper.append(input, saveBtn, cancelBtn);
      otherNamesContainer.appendChild(wrapper);
      input.focus();
    };

    otherNamesContainer.append(label, list, addBtn);

    /* GRID */

    const grid = document.createElement("div");
    grid.className = "meta-grid";

    grid.innerHTML = `
      <div><span>Total Chapters</span><strong>${manga.total_chapters ?? "-"}</strong></div>
      <div><span>Latest Chapter</span><strong>${manga.latest_chapter ?? "-"}</strong></div>
      <div><span>Release Date</span><strong>${manga.release_date ?? "-"}</strong></div>
      <div><span>Source</span><strong>${manga.source_api ?? "Manual"}</strong></div>
    `;

    /* ACTIONS */

    const actions = document.createElement("div");
    actions.className = "meta-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-primary";
    editBtn.textContent = "Edit Metadata";

    editBtn.onclick = () => openEditMetadataModal({
  ...manga,
  progress_id: progressId,
  redirect_url: progress.redirect_url
});

    const manageBtn = document.createElement("button");
    manageBtn.className = "btn-secondary";
    manageBtn.textContent = "Manage Sources";

    manageBtn.onclick = () => openMetadataManager(manga.id);

    const refreshBtn = document.createElement("button");
    refreshBtn.className = "btn-secondary";
    refreshBtn.textContent = "Refresh Metadata";

    refreshBtn.onclick = async () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "Refreshing...";

      await refreshManga(manga.id);
      renderDetailsView(progressId);
    };

    actions.append(editBtn, manageBtn, refreshBtn);

    metaCard.append(metaTitle, otherNamesContainer, grid, actions);

    /* =========================
       BUILD PAGE
    ========================= */

    page.append(
      topBar,
      header,
      statusSection,
      tagSection,
      progressSection,
      metaCard
    );

    root.appendChild(page);

  } catch (err) {
    console.error(err);
    root.innerHTML = `<div class="error">Failed to load manga details.</div>`;
  }
}

/* =========================
   TAG EDITOR
========================= */

function renderTagEditor(container, mangaId, activeTags) {

  container.innerHTML = "";

  if (!store.tags || !store.tags.length) return;

  store.tags.forEach(tag => {

    const el = document.createElement("div");
    el.className = "filter-chip";
    el.textContent = tag.name;

    el.style.borderColor = tag.color;

    if (activeTags.includes(tag.id)) {

      el.classList.add("active");
      el.style.backgroundColor = tag.color;
      el.style.color = "#fff";
    }

    el.onclick = async () => {

      let updated = [...activeTags];

      if (updated.includes(tag.id))
        updated = updated.filter(t => t !== tag.id);
      else
        updated.push(tag.id);

      await updateMangaTags(mangaId, updated);

      renderTagEditor(container, mangaId, updated);

    };

    container.appendChild(el);

  });

}