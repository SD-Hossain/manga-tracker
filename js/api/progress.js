// js/api/progress.js

import { authFetch } from "./client.js";

/**
 * Create or update reading progress
 * Used when adding manga (manual or extension)
 */
export async function saveProgress({ title, lastChapter, redirectUrl, metadata })
 {
  return await authFetch("/reading-progress", {
    method: "POST",
    body: JSON.stringify({
      title,
      lastChapter,
      redirectUrl,
      metadata
    })
  });
}

/**
 * Update chapter count and redirect URL
 * Used by chapter counter (+ / -)
 */
export async function updateProgress(progressId, { chapter, redirectUrl }) {
  return await authFetch(`/reading-progress/${progressId}`, {
    method: "PATCH",
    body: JSON.stringify({
      chapter,
      redirectUrl
    })
  });
}

/**
 * Get a single reading progress entry by ID
 * Used by manga details page
 */
export async function getProgress(progressId) {
  return await authFetch(`/reading-progress/${progressId}`);
}

/**
 * Delete reading progress (and related manga)
 */
export async function deleteProgress(progressId) {
  return await authFetch(`/reading-progress/${progressId}`, {
    method: "DELETE"
  });
}

export async function updateStatus(progressId, status) {
  return await authFetch(`/reading-progress/${progressId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}
