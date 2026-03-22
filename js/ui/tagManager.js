// js/ui/tagManager.js

import { createModal } from "./modal.js";
import { confirmAction } from "./confirm.js";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag
} from "../api/tags.js";
import { store } from "../state/store.js";
import { showToast } from "../utils/toast.js";

export async function openTagManager() {
  await loadTags();

  const wrapper = document.createElement("div");
  wrapper.className = "form-stack";

  const list = document.createElement("div");
  list.className = "tag-list";

  const addSection = createAddSection(list);

  wrapper.append(addSection, list);

  renderTagList(list);

  const modal = createModal({
    title: "Manage Tags",
    content: wrapper,
    actions: [
      {
        label: "Close",
        variant: "btn-secondary",
        onClick: () => modal.close()
      }
    ]
  });
}

/* ===============================
   LOAD TAGS
=============================== */

async function loadTags() {
  const tags = await fetchTags();
  store.tags = tags;
}

/* ===============================
   RENDER TAG LIST
=============================== */

function renderTagList(container) {
  container.innerHTML = "";

  if (!store.tags.length) {
    container.innerHTML = `<div class="empty-state">No tags yet</div>`;
    return;
  }

  store.tags.forEach(tag => {
    container.appendChild(createTagRow(tag, container));
  });
}

/* ===============================
   TAG ROW
=============================== */

function createTagRow(tag, container) {
  const row = document.createElement("div");
  row.className = "tag-row";

  const nameInput = document.createElement("input");
  nameInput.value = tag.name;

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = tag.color;

  const saveBtn = createBtn("Save", async () => {
    try {
      await updateTag(tag.id, {
        name: nameInput.value,
        color: colorInput.value
      });

      tag.name = nameInput.value;
      tag.color = colorInput.value;

      showToast("Tag updated", "success");
    } catch {
      showToast("Failed to update tag", "error");
    }
  }, "btn-primary");

  const deleteBtn = createBtn("Delete", async () => {
    const ok = await confirmAction({
    title: "Delete Tag",
    message: `Delete "${tag.name}"?`,
    confirmText: "Delete"
  });

if (!ok) return;

    try {
      await deleteTag(tag.id);
      store.tags = store.tags.filter(t => t.id !== tag.id);
      renderTagList(container);

      showToast("Tag deleted", "success");
    } catch {
      showToast("Failed to delete tag", "error");
    }
  }, "btn-danger");

  if (tag.is_system) {
    nameInput.disabled = true;
    colorInput.disabled = true;
    deleteBtn.disabled = true;
  }

  const colorPreview = document.createElement("div");
colorPreview.className = "tag-color-preview";
colorPreview.style.background = tag.color;

colorInput.addEventListener("input", () => {
  colorPreview.style.background = colorInput.value;
});

const inputs = document.createElement("div");
inputs.className = "tag-inputs";

inputs.append(nameInput, colorInput);

const actions = document.createElement("div");
actions.className = "tag-actions";

actions.append(saveBtn, deleteBtn);

row.append(colorPreview, inputs, actions);

  return row;
}

/* ===============================
   ADD SECTION
=============================== */

function createAddSection(container) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-group";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "New tag name";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#6366f1";

  const addBtn = createBtn("Create", async () => {
    if (!nameInput.value.trim()) return;

    try {
      const { id } = await createTag({
        name: nameInput.value,
        color: colorInput.value
      });

      store.tags.push({
        id,
        name: nameInput.value,
        color: colorInput.value,
        is_system: false
      });

      renderTagList(container);

      nameInput.value = "";

      showToast("Tag created", "success");
    } catch {
      showToast("Failed to create tag", "error");
    }
  }, "btn-primary");

  wrapper.append(nameInput, colorInput, addBtn);

  return wrapper;
}

/* ===============================
   BUTTON HELPER
=============================== */

function createBtn(text, onClick, variant = "btn-secondary") {
  const btn = document.createElement("button");
  btn.className = `btn ${variant}`;
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}