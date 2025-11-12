import { Injectable, RendererFactory2, Renderer2, DOCUMENT, Inject, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2;
  private readonly themeSubject = new BehaviorSubject<Theme>('light');

  public readonly theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  /**
   * Get current theme.
   */
  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Toggle between light and dark theme.
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set theme (light or dark) and persist to localStorage.
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.persistTheme(theme);
    this.applyThemeToDocument(theme);
  }

  /**
   * Initialize theme from localStorage or system preference.
   */
  private initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    const systemPreference = this.getSystemThemePreference();
    const initialTheme: Theme = savedTheme ?? systemPreference;
    this.setTheme(initialTheme);
  }

  /**
   * Get saved theme from localStorage.
   */
  private getSavedTheme(): Theme | null {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : null;
  }

  /**
   * Get system theme preference.
   */
  private getSystemThemePreference(): Theme {
    const prefersDark = window.matchMedia(DARK_MEDIA_QUERY).matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Persist theme to localStorage.
   */
  private persistTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  /**
   * Apply theme classes to document body.
   */
  private applyThemeToDocument(theme: Theme): void {
    const body = this.document.body;

    if (theme === 'dark') {
      this.renderer.addClass(body, DARK_THEME_CLASS);
      this.renderer.removeClass(body, LIGHT_THEME_CLASS);
    } else {
      this.renderer.addClass(body, LIGHT_THEME_CLASS);
      this.renderer.removeClass(body, DARK_THEME_CLASS);
    }
  }
}

