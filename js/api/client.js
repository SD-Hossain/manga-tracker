// js/api/client.js

export const API_BASE = "https://manga-tracker-backend-pqmw.onrender.com/api";

/**
 * Auth-aware fetch wrapper
 * Automatically attaches Bearer token if present
 */
export async function authFetch(path, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // Handle auth expiration globally
  if (response.status === 401) {
    console.warn("Unauthorized — token may be expired");
    localStorage.removeItem("authToken");
    throw new Error("Unauthorized");
  }

  // Handle non-OK responses
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // No content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
