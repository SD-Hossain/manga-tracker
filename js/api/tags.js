// js/api/tags.js

import { authFetch } from "./client.js";

/**
 * Load all tags for current user
 */
export async function fetchTags() {
  return await authFetch("/tags");
}

/**
 * Create a new tag
 */
export async function createTag({ name, color }) {
  return await authFetch("/tags", {
    method: "POST",
    body: JSON.stringify({ name, color })
  });
}

/**
 * Update an existing tag
 */
export async function updateTag(tagId, { name, color }) {
  return await authFetch(`/tags/${tagId}`, {
    method: "PATCH",
    body: JSON.stringify({ name, color })
  });
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId) {
  return await authFetch(`/tags/${tagId}`, {
    method: "DELETE"
  });
}

/**
 * Update tags attached to a manga
 * Replaces existing tag links
 */
export async function updateMangaTags(mangaId, tagIds) {
  return await authFetch(`/manga/${mangaId}/tags`, {
    method: "PATCH",
    body: JSON.stringify({ tagIds })
  });
}
