// js/modals/metadataManager.js

import { createModal } from "../ui/modal.js";
import { authFetch } from "../api/client.js";
import { showToast } from "../utils/toast.js";


export async function openMetadataManager(mangaId) {
  
  const wrapper = document.createElement("div");
  wrapper.className = "form-stack";

  wrapper.innerHTML = `<div class="loading">Loading metadata...</div>`;

  const modal = createModal({
    title: "Manage Metadata",
    content: wrapper,
    actions: []
  });

  try {
    const data = await authFetch(`/manga/${mangaId}/metadata-sources`);
    const sources = Object.values(data.sources || {});

    wrapper.innerHTML = "";

    const fields = [
      "title",
      "description",
      "coverUrl",
      "genres",
      "totalChapters",
      "latestChapter"
    ];

    const selections = {};

    fields.forEach(field => {
      wrapper.appendChild(
        createFieldSection(field, sources, selections)
      );
    });

    // SAVE BUTTON
    modal.footer.appendChild(createSaveBtn(mangaId, selections, modal));

  } catch {
    wrapper.innerHTML = `<div class="error">Failed to load metadata</div>`;
  }
}

/* ===============================
   FIELD SECTION
=============================== */

function createFieldSection(field, sources, selections) {
  const section = document.createElement("div");
  section.className = "meta-field";

  const title = document.createElement("h3");
  title.textContent = field.toUpperCase();

  const options = document.createElement("div");
  options.className = "meta-options";

  sources.forEach(source => {
    const value = source[field];
    if (!value) return;

    const card = document.createElement("div");
    card.className = "meta-option";

    card.appendChild(renderFieldValue(field, value));

    const label = document.createElement("span");
    label.className = "meta-source";
    label.textContent = source.source;

    card.appendChild(label);

    card.onclick = () => {

  // if already selected → unselect
  if (selections[field] === value) {
    delete selections[field];

    card.classList.remove("active");

    const label = card.querySelector(".meta-selected");
    if (label) label.remove();

    return;
  }

  // remove others
  options.querySelectorAll(".meta-option").forEach(el => {
    el.classList.remove("active");

    const label = el.querySelector(".meta-selected");
    if (label) label.remove();
  });

  // set new
  selections[field] = value;

  card.classList.add("active");

  const selectedLabel = document.createElement("span");
  selectedLabel.textContent = "Selected";
  selectedLabel.className = "meta-selected";

  card.appendChild(selectedLabel);
};

    options.appendChild(card);
  });

  section.append(title, options);

  return section;
}

/* ===============================
   FIELD RENDERER
=============================== */

function renderFieldValue(field, value) {
  const el = document.createElement("div");

  if (field === "coverUrl") {
    const img = document.createElement("img");
    img.src = value;
    img.className = "meta-cover";
    return img;
  }

  if (field === "genres") {
    const wrap = document.createElement("div");
    wrap.className = "meta-genres";

    value.forEach(g => {
      const chip = document.createElement("span");
      chip.textContent = g;
      wrap.appendChild(chip);
    });

    return wrap;
  }

  const fullText = String(value);
let expanded = false;

const text = document.createElement("p");
const btn = document.createElement("button");

btn.className = "btn btn-ghost";

function render() {
  if (expanded) {
    text.textContent = fullText;
    btn.textContent = "Show less";
  } else {
    text.textContent =
      fullText.slice(0, 120) + (fullText.length > 120 ? "..." : "");
    btn.textContent = "Show more";
  }
}

btn.onclick = () => {
  expanded = !expanded;
  render();
};

render();

el.append(text, btn);
return el;
}

/* ===============================
   SAVE BUTTON
=============================== */

function createSaveBtn(mangaId, selections, modal) {
  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Save Selection";

  btn.onclick = async () => {
    try {
      const payload = {
      title: selections.title,
      description: selections.description,
      genres: selections.genres,
      cover_url: selections.coverUrl,
      total_chapters: selections.totalChapters,
      latest_chapter: selections.latestChapter
      };

    await authFetch(`/manga/${mangaId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
      });

      await authFetch(`/manga/${mangaId}/refresh`, {
        method: "POST"
      });
    // re-render details view
      window.dispatchEvent(new PopStateEvent("popstate"));
      showToast("Metadata updated", "success");
      modal.close();

    } catch {
      showToast("Failed to update metadata", "error");
    }
  };

  return btn;
}