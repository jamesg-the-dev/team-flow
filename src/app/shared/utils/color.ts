/**
 * Convert a CSS color string (hex `#rrggbb`, `#rgb`, or `rgb()/rgba()`) to
 * an `rgba(r, g, b, a)` string with the given alpha. Falls back to the
 * original color if it cannot be parsed.
 */
export function withAlpha(color: string, alpha: number): string {
  const trimmed = color.trim();

  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  const match = trimmed.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const parts = match[1].split(',').map(p => p.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return trimmed;
}
