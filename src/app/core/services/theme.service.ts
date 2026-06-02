import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'teamflow.theme';

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

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>('system');
  private readonly _paletteVersion = signal(0);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mode = this._mode.asReadonly();

  readonly chartPalette = computed<ChartPalette>(() => {
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
    this.setMode(current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system');
  }

  private readChartPalette(): ChartPalette {
    if (!isPlatformBrowser(this.platformId)) {
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
