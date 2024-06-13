import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  readonly localeList = [{code:'fr', label : "Français"},{code:'en', label:'English'}];

  private _currentLocale!: string;
  constructor(private router : Router) { 
    this.initLocale()
  }


  initLocale() : void{
    const currentLocale = this.router.url.split('/')[0];
    console.log(this.currentLocaleID)
    this.currentLocaleID = currentLocale;
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
