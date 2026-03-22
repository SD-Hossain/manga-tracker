// js/state/filters.js

/**
 * Apply all active filters to the library list
 * AND logic between all filter categories
 */
export function applyFilters(library = [], filters = {}) {
  let result = [...library];

  // ===============================
// 1️⃣ SEARCH FILTER (Title + Other Names)
// ===============================
if (filters.search && filters.search.trim() !== "") {

  const q = filters.search.trim().toLowerCase();

  result = result.filter(item => {

    const titleMatch =
      (item.title || "").toLowerCase().includes(q);

    let otherNames = [];

    try {
      otherNames = typeof item.other_names === "string"
        ? JSON.parse(item.other_names)
        : item.other_names || [];
    } catch {
      otherNames = [];
    }

    const otherMatch = otherNames.some(name =>
      name.toLowerCase().includes(q)
    );

    return titleMatch || otherMatch;

  });

}
  // ===============================
  // 2️⃣ STATUS FILTER
  // ===============================
  if (filters.status && filters.status !== "all") {
    result = result.filter(item =>
      item.status === filters.status
    );
  }

  // ===============================
  // 3️⃣ TAG FILTER (AND logic)
  // ===============================
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = result.filter(item => {
      if (!Array.isArray(item.tags) || item.tags.length === 0) {
        return false;
      }

      // Must contain ALL selected tags
      return filters.tags.every(tagId =>
        item.tags.includes(tagId)
      );
    });
  }

  // ===============================
  // 4️⃣ GENRE FILTER (AND logic)
  // ===============================
  if (Array.isArray(filters.genres) && filters.genres.length > 0) {
    result = result.filter(item => {
      let genres = normalizeGenres(item.genres);

      if (!genres.length) return false;

      // Must contain ALL selected genres
      return filters.genres.every(selected =>
        genres.includes(selected)
      );
    });
  }

  // ===============================
  // 5️⃣ SORTING
  // ===============================
  result = applySorting(result, filters.sort);

  return result;
}

/**
 * Normalize genre field safely
 */
function normalizeGenres(genres) {
  if (!genres) return [];

  if (Array.isArray(genres)) {
    return genres;
  }

  if (typeof genres === "string") {
    try {
      const parsed = JSON.parse(genres);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Apply sorting logic
 */
function applySorting(list, sortType) {
  const result = [...list];

  switch (sortType) {
    case "title_asc":
      return result.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );

    case "title_desc":
      return result.sort((a, b) =>
        (b.title || "").localeCompare(a.title || "")
      );

    case "chapter_desc":
      return result.sort((a, b) =>
        (b.last_chapter || 0) - (a.last_chapter || 0)
      );

    case "chapter_asc":
      return result.sort((a, b) =>
        (a.last_chapter || 0) - (b.last_chapter || 0)
      );

    case "recent":
    default:
      return result.sort((a, b) =>
        new Date(b.last_read_at || 0) -
        new Date(a.last_read_at || 0)
      );
  }
}
