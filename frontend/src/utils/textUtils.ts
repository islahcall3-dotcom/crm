/**
 * Utility functions for Arabic text normalization and fuzzy searching.
 * Handles variations in Alef (أ, إ, آ -> ا), Ta Marbuta (ة -> ه),
 * Alef Maksura (ى -> ي), and strips diacritics/tashkeel.
 */

export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alef variations to bare Alef
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Ta Marbuta to Ha
    .replace(/ة/g, 'ه')
    // Normalize Alef Maksura to Ya
    .replace(/ى/g, 'ي');
}

/**
 * Checks if a target string contains a search query with Arabic normalization.
 */
export function matchesSearch(target: string | number | null | undefined, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (target === null || target === undefined) return false;
  const normalizedTarget = normalizeArabic(String(target));
  const normalizedQuery = normalizeArabic(query.trim());
  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Checks if any of the target fields matches the query.
 */
export function matchesAnyField(targets: (string | number | null | undefined)[], query: string): boolean {
  if (!query || !query.trim()) return true;
  return targets.some(target => matchesSearch(target, query));
}
