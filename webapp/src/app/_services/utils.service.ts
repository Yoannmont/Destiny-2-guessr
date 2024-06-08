import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Armor } from '../_classes/armor';
import { Collectible } from '../_classes/collectible';
import { Weapon } from '../_classes/weapon';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  sidebarLayout: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSidebarVisible: boolean = this.isScreenSizeLarge();

  public readonly navbarContent = [
    { title: $localize`Jouer`, link: 'gamemode/' },
    { title: $localize`Collections`, link: 'collections/' },
    { title: $localize`À propos`, link: 'about/' },
  ];

  public bungieUrl = 'https://bungie.net';

  public iconsPath = '/common/destiny2_content/icons/';
  public screenshotPath = '/common/destiny2_content/screenshots/';

  isScreenSizeLarge(): boolean {
    return window.matchMedia('(min-width : 992px').matches;
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  reloadPage(): void {
    location.reload();
  }

  createIconLink(iconCode: string | undefined): string {
    return this.bungieUrl + this.iconsPath + iconCode + '.jpg';
  }

  createScreenshotLink(screenshotCode: string): string {
    return this.bungieUrl + this.screenshotPath + screenshotCode + '.jpg';
  }

  createDamageTypeLink(iconCode: string): string {
    return this.bungieUrl + this.iconsPath + iconCode + '.png';
  }

  isArmor(collectible: Collectible): collectible is Armor {
    return (
      (collectible as Armor).classType !== undefined
    );
  }

  isWeapon(collectible: Collectible): collectible is Weapon {
    return (
      (collectible as Weapon).category !== undefined &&
      (collectible as Weapon).defaultDamageType !== undefined &&
      (collectible as Weapon).type !== undefined
    );
  }
}
