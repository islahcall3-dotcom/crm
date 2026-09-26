/**
 * Backend text utilities for Arabic normalization and resilient search.
 */

export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

export function matchesSearch(target: string | number | null | undefined, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (target === null || target === undefined) return false;
  return normalizeArabic(String(target)).includes(normalizeArabic(query));
}

export function matchesAnyField(targets: (string | number | null | undefined)[], query: string): boolean {
  if (!query || !query.trim()) return true;
  return targets.some(target => matchesSearch(target, query));
}

/**
 * Returns alternative Arabic spelling variants for SQL LIKE queries.
 */
export function getArabicSearchVariants(query: string): string[] {
  const q = query.trim();
  if (!q) return [];
  const variants = new Set<string>();
  variants.add(q);

  // Bare alef variant
  const bareAlef = q.replace(/[أإآٱ]/g, 'ا');
  variants.add(bareAlef);
  variants.add(q.replace(/[ا]/g, 'أ'));
  variants.add(q.replace(/[ا]/g, 'إ'));

  // Ta Marbuta / Ha variant
  variants.add(q.replace(/ة/g, 'ه'));
  variants.add(q.replace(/ه/g, 'ة'));

  // Ya / Alef Maksura variant
  variants.add(q.replace(/ي/g, 'ى'));
  variants.add(q.replace(/ى/g, 'ي'));

  return Array.from(variants);
}
