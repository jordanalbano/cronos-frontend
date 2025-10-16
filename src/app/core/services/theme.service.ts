import { Injectable } from '@angular/core';

/**
 * Servicio para gestionar las variables del tema (Design Tokens).
 * Por ahora, exporta los tokens. En el futuro, podría manejar el cambio
 * de tema (ej. light/dark).
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public tokens = {
    primaryColor: 'var(--primary-color)',
    surfaceGround: 'var(--surface-ground)',
    surfaceCard: 'var(--surface-card)',
    textColor: 'var(--text-color)',
    textColorSecondary: 'var(--text-color-secondary)',
    glassBg: 'var(--glass-bg)',
    glassBlur: 'var(--glass-blur)',
  };

  constructor() { }

  // En el futuro:
  // public setTheme(theme: 'light' | 'dark'): void { ... }
}
