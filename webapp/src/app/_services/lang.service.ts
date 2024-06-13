import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  readonly localeList = [{code:'fr', label : "Français"},{code:'en', label:'English'}];

  private readonly _currentLocale: string = this.initLocale();
  
  constructor(@Inject(DOCUMENT) private document : Document) { 
    this._currentLocale = this.initLocale();
    console.log(this._currentLocale);
  }


  initLocale() : string{
    return this.document.documentElement.lang;
  }

  localizeProperty(property : string): string{
    return `${property}_${this._currentLocale}`;
  }

  get currentLocaleID(){
    return this._currentLocale;
  }

}
