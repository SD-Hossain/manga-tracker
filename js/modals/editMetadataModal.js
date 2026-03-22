// js/modals/editMetadataModal.js

import { showToast } from "../utils/toast.js";
import { authFetch } from "../api/client.js";


/* ===============================
   ImgBB Upload
================================ */

async function uploadToImgBB(file) {

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result.split(",")[1]);
    };

    reader.onerror = reject;
  });

  const data = await authFetch("/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: base64 })
  });

  if (!data.success) {
    throw new Error("ImgBB upload failed");
  }

  return {
    url: data.data.url,
    delete_url: data.data.delete_url
  };
}
/* ===============================
   OPEN MODAL
================================ */

export function openEditMetadataModal(manga) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal-window metadata-edit-modal";

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const genres = parseGenres(manga.genres);

  let genreList = [...genres];

  let uploadedCoverUrl = manga.cover_url;
  let uploadedDeleteUrl = manga.cover_delete_url;

  modal.innerHTML = `
    <div class="modal-header">
      <h2>Edit Metadata</h2>
      <button class="modal-close">✕</button>
    </div>

    <div class="meta-cover-edit">
      <img class="meta-cover-preview" src="${manga.cover_url || "/assets/images/placeholder-cover.png"}">

      <div class="cover-buttons">
        <input type="file" id="coverUpload">
        <button class="btn-danger delete-cover">Remove Cover</button>
      </div>
    </div>

    <div class="meta-edit-grid">
      <div class="meta-field">
        <label>Reading URL</label>
        <input id="metaUrl" value="${manga.redirect_url || ""}">
      </div>

      <div class="meta-field full">
        <label>Description</label>
        <textarea id="metaDesc">${manga.description || ""}</textarea>
      </div>

      <div class="meta-field">
        <label>Total Chapters</label>
        <input id="metaTotal" type="number" value="${manga.total_chapters || ""}">
      </div>

      <div class="meta-field">
        <label>Latest Chapter</label>
        <input id="metaLatest" type="number" value="${manga.latest_chapter || ""}">
      </div>

      <div class="meta-field">
        <label>Release Date</label>
        <input id="metaRelease" value="${manga.release_date || ""}">
      </div>

      <div class="meta-field full">
        <label>Genres</label>
        <div class="genre-chip-container"></div>
        <input class="genre-input" placeholder="Add genre and press Enter">
      </div>

    </div>

    <div class="modal-footer">
      <button class="btn-secondary cancel-btn">Cancel</button>
      <button class="btn-primary save-btn">Save Changes</button>
    </div>
  `;

  const coverImg = modal.querySelector(".meta-cover-preview");
  const uploadInput = modal.querySelector("#coverUpload");

  modal.querySelector(".modal-close").onclick = () => overlay.remove();
  modal.querySelector(".cancel-btn").onclick = () => overlay.remove();

  /* ===============================
     COVER UPLOAD
  ============================== */

 let selectedFile = null;

uploadInput.onchange = () => {

  const file = uploadInput.files[0];
  if (!file) return;

  selectedFile = file;

  const reader = new FileReader();

  reader.onload = () => {
    coverImg.src = reader.result;
  };

  reader.readAsDataURL(file);

};

  /* ===============================
     DELETE COVER
  ============================== */

  modal.querySelector(".delete-cover").onclick = () => {

  selectedFile = null;

  uploadedCoverUrl = null;
  uploadedDeleteUrl = null;

  coverImg.src = "/assets/images/placeholder-cover.png";

};

  /* ===============================
     GENRE CHIPS
  ============================== */

  const chipContainer = modal.querySelector(".genre-chip-container");
  const genreInput = modal.querySelector(".genre-input");

  function renderGenres() {

    chipContainer.innerHTML = "";

    genreList.forEach((g, i) => {

      const chip = document.createElement("div");
      chip.className = "genre-chip";

      chip.innerHTML = `
        ${g}
        <span>✕</span>
      `;

      chip.querySelector("span").onclick = () => {
        genreList.splice(i, 1);
        renderGenres();
      };

      chipContainer.appendChild(chip);

    });

  }

  renderGenres();

  genreInput.onkeydown = (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      const val = genreInput.value.trim();
      if (!val) return;

      genreList.push(val);
      genreInput.value = "";

      renderGenres();

    }

  };

  /* ===============================
     SAVE METADATA
  ============================== */

const saveBtn = modal.querySelector(".save-btn");

saveBtn.onclick = async () => {

  if (saveBtn.dataset.loading) return;

  try {

    saveBtn.dataset.loading = "true";
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <span class="btn-spinner"></span>
      Saving...
    `;

    let coverUrl = manga.cover_url;
    let deleteUrl = manga.cover_delete_url;

    /* Upload image only if selected */

    if (selectedFile) {
      showToast("Uploading cover...", "info", 2000);
      const uploadResult = await uploadToImgBB(selectedFile);
      coverUrl = uploadResult.url;
      deleteUrl = uploadResult.delete_url;
    }

    const updated = {

      description: modal.querySelector("#metaDesc").value,

      total_chapters: modal.querySelector("#metaTotal").value
        ? Number(modal.querySelector("#metaTotal").value)
        : null,

      latest_chapter: modal.querySelector("#metaLatest").value
        ? Number(modal.querySelector("#metaLatest").value)
        : null,

      release_date: modal.querySelector("#metaRelease").value || null,

      genres: genreList,

      cover_url: coverUrl,
      cover_delete_url: deleteUrl

    };

    await authFetch(`/manga/${manga.id}`, {
      method: "PATCH",
      body: JSON.stringify(updated)
    });

    const urlValue = modal.querySelector("#metaUrl").value;

    await authFetch(`/reading-progress/${manga.progress_id}`, {
  method: "PATCH",
  body: JSON.stringify({
    redirectUrl: urlValue || null
  })
});

    overlay.remove();
    showToast("Metadata updated successfully", "success");
    setTimeout(() => {
      location.reload();
    }, 1200);

  } catch (err) {

    console.error(err);
    showToast("Failed to save metadata", "error");

    saveBtn.disabled = false;
    saveBtn.dataset.loading = "";
    saveBtn.textContent = "Save Changes";

  }

};

}

/* ===============================
   PARSE GENRES
================================ */

function parseGenres(g) {

  try {

    if (!g) return [];

    return typeof g === "string"
      ? JSON.parse(g)
      : g;

  } catch {

    return [];

  }

}