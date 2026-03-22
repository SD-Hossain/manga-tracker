// js/api/manga.js

import { authFetch } from "./client.js";

/**
 * Update manga metadata manually
 */
export async function updateManga(mangaId, payload) {
  return await authFetch(`/manga/${mangaId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
export async function refreshManga(mangaId) {
  return await authFetch(`/manga/${mangaId}/refresh`, {
    method: "POST"
  });
}
