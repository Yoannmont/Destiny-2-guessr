import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  sidebarLayout: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSidebarVisible: boolean = this.isScreenSizeLarge();



  public readonly navbarContent = [
    { title: $localize`Jouer`, link: 'gamemode/' },
    { title: $localize`Collections`, link: 'collections/' },
    { title: $localize`À propos`, link: 'about/'}
  ];

  public bungieUrl = 'https://bungie.net';

  public iconsPath = "/common/destiny2_content/icons/"
  public screenshotPath = "/common/destiny2_content/screenshots/"


  isScreenSizeLarge() : boolean {
    return window.matchMedia('(min-width : 992px').matches;
  }


  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  reloadPage():void{
    location.reload();
  }

  createWeaponIconLink(iconCode : string | undefined) : string {
    return this.bungieUrl + this.iconsPath + iconCode + '.jpg';
  }

  createWeaponScreenshotLink(screenshotCode : string) : string{
    return this.bungieUrl + this.screenshotPath + screenshotCode + '.jpg';
  }

  createDamageTypeLink(iconCode : string) : string {
    return this.bungieUrl + this.iconsPath + iconCode + '.png';
  }

}
