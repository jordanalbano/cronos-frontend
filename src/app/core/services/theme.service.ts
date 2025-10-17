import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme-preference';
  private readonly TRANSITION_CLASS = 'theme-transitioning';

  public currentTheme = signal<Theme>('light');

  public tokens = {
    primaryColor: 'var(--primary-color)',
    surfaceGround: 'var(--surface-ground)',
    surfaceCard: 'var(--surface-card)',
    textColor: 'var(--text-color)',
    textColorSecondary: 'var(--text-color-secondary)',
    glassBg: 'var(--glass-bg)',
    glassBlur: 'var(--glass-blur)',
  };

  constructor() {
    this.initTheme();
    this.setupSystemThemeListener();

    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  public toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public setTheme(theme: Theme): void {
    this.addTransitionClass();
    this.currentTheme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    const initialTheme = savedTheme || this.detectSystemTheme();
    this.currentTheme.set(initialTheme);
  }

  private detectSystemTheme(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        if (!savedTheme) {
          this.currentTheme.set(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }

  private addTransitionClass(): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.add(this.TRANSITION_CLASS);
      setTimeout(() => {
        root.classList.remove(this.TRANSITION_CLASS);
      }, 300);
    }
  }
}
