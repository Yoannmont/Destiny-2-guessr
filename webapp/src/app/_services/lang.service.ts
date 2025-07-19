
import { Inject, Injectable, DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LangService {
  readonly localeList = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    // { code: 'de', label: 'Deutsch' },
    // { code: 'es', label: 'Español' },
  ];

  readonly flagMap: { [key: string]: string } = {
    en: 'us',
    fr: 'fr',
    // es: 'es',
    // de: 'de',
  };
  readonly codeList = this.localeList.map((locale) => locale.code);

  private readonly _currentLocale: string = this.initLocale();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this._currentLocale = this.initLocale();
  }

  initLocale(): string {
    return this.document.documentElement.lang;
  }

  get currentLocaleID() {
    return this._currentLocale;
  }
  getFlagCode(langCode: string): string {
    return this.flagMap[langCode] || langCode;
  }

  reduceLabels(
    dict: Dictionary,
    labelName: string,
    lang: string = this._currentLocale
  ): ReducedLabel[] {
    const reduced: ReducedLabel[] = [];

    for (const key in dict) {
      const entry = dict[key];
      const labelValue = entry[lang] ?? entry['en'] ?? '';
      reduced.push({
        id: isNaN(Number(key)) ? key : Number(key),
        [labelName]: labelValue,
      });
    }

    return reduced;
  }
}

export type Translations = Record<string, string>;
export type Dictionary = Record<string | number, Translations>;

export type ReducedLabel = {
  id: string | number;
  [key: string]: string | number;
};
