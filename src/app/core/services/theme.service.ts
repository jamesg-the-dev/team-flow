import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'teamflow.theme';

/**
 * Resolved palette of theme tokens that are safe to pass to libraries that
 * cannot consume CSS custom properties (e.g. Chart.js / ng2-charts).
 */
export interface ChartPalette {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  surface: string;
  surfaceVariant: string;
  outline: string;
  outlineVariant: string;
  tertiary: string;
}

/**
 * Manages the application color theme.
 *
 * Strategy:
 *   - `system` (default) follows the OS `prefers-color-scheme` preference
 *     via the CSS `@media` rule defined in `_theme.scss`.
 *   - `light` / `dark` are explicit overrides applied by setting the
 *     `data-theme` attribute on `<html>`, which our SCSS keys off.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>('system');
  /** Bumps whenever the resolved palette may have changed. */
  private readonly _paletteVersion = signal(0);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mode = this._mode.asReadonly();

  /**
   * Reactive snapshot of theme colors resolved from the active M3
   * `--sys-*` tokens. Recomputes whenever the theme mode changes or the
   * OS color-scheme preference flips. Useful for libraries that cannot
   * consume CSS custom properties directly (e.g. Chart.js).
   */
  readonly chartPalette = computed<ChartPalette>(() => {
    // Establish dependencies so the computed re-evaluates on theme changes.
    this._mode();
    this._paletteVersion();
    return this.readChartPalette();
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        this.setMode(stored);
      }

      // When in `system` mode, react to OS-level color-scheme changes so
      // theme-derived values (like chart palettes) refresh automatically.
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', () => {
        if (this._mode() === 'system') {
          this._paletteVersion.update(v => v + 1);
        }
      });
    }
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    const html = this.document.documentElement;

    if (mode === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', mode);
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, mode);
    }

    this._paletteVersion.update(v => v + 1);
  }

  toggle(): void {
    const current = this._mode();
    // system -> dark -> light -> system
    this.setMode(current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system');
  }

  private readChartPalette(): ChartPalette {
    if (!isPlatformBrowser(this.platformId)) {
      // Sensible fallback (M3 azure light primary) for SSR / tests.
      return {
        primary: '#415f91',
        onPrimary: '#ffffff',
        primaryContainer: '#d6e3ff',
        onSurface: '#191c20',
        onSurfaceVariant: '#43474e',
        surface: '#f8f9ff',
        surfaceVariant: '#dfe2eb',
        outline: '#74777f',
        outlineVariant: '#c4c6d0',
        tertiary: '#415e92',
      };
    }

    const styles = getComputedStyle(this.document.documentElement);
    const read = (token: string, fallback: string) =>
      styles.getPropertyValue(token).trim() || fallback;

    return {
      primary: read('--sys-primary', '#415f91'),
      onPrimary: read('--sys-on-primary', '#ffffff'),
      primaryContainer: read('--sys-primary-container', '#d6e3ff'),
      onSurface: read('--sys-on-surface', '#191c20'),
      onSurfaceVariant: read('--sys-on-surface-variant', '#43474e'),
      surface: read('--sys-surface', '#f8f9ff'),
      surfaceVariant: read('--sys-surface-variant', '#dfe2eb'),
      outline: read('--sys-outline', '#74777f'),
      outlineVariant: read('--sys-outline-variant', '#c4c6d0'),
      tertiary: read('--sys-tertiary', '#415e92'),
    };
  }
}
