/**
 * Derive up to two uppercase initials from a name or email-like string.
 * Splits on whitespace and common separators (`@`, `.`, `_`, `-`).
 * Returns `fallback` when no usable characters can be extracted.
 */
export function getInitials(source: string | null | undefined, fallback = '?'): string {
  const value = (source ?? '').trim();
  if (!value) {
    return fallback;
  }
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
  return initials || value.charAt(0).toUpperCase() || fallback;
}
