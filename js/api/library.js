// js/api/library.js

import { authFetch } from "./client.js";

/**
 * Load full user library
 * Returns array of manga + progress objects
 */
export async function loadLibrary() {
  const data = await authFetch("/library");
  return data;
}
