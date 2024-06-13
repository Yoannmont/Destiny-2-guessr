import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  readonly localeList = [{code:'fr', label : "Français"},{code:'en', label:'English'}];

  private _currentLocale: string = this.initLocale();
  
  constructor(@Inject(DOCUMENT) private document : Document) { 
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

  set currentLocaleID(value : string){
    if (this.localeList.filter( (langObject) => langObject.code === value)){
      this._currentLocale = value;
    }
  }
}
