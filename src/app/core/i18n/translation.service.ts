import { HttpClient } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private http = inject(HttpClient);
  private translations = signal<Record<string, string>>({});

  async loadTranslations(lang: string = 'es'): Promise<void> {
    try {
      const data = await lastValueFrom(this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`));
      this.translations.set(data);
    } catch (error) {
      console.error(`Could not load translations for lang ${lang}`, error);
      this.translations.set({});
    }
  }

  translate(key: string, params?: Record<string, string>): string {
    let translation = this.translations()[key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, params[paramKey]);
      });
    }
    return translation;
  }
}
