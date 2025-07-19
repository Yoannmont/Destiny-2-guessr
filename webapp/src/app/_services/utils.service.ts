import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isArmorLabel, isWeaponLabel, Item } from '../_classes/item';
import { getPlatformName } from '../_classes/platform';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  sidebarLayout: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSidebarVisible: boolean = this.isScreenSizeLarge();
  readonly timeoutDuration: number = 15000;

  public readonly navbarContent = [
    { title: $localize`Jouer`, link: 'gamemode/' },
    { title: $localize`Collections`, link: 'collections/' },
    { title: $localize`À propos`, link: 'about/' },
  ];

  public bungieUrl = 'https://bungie.net/';

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
    return this.bungieUrl + iconCode;
  }

  createScreenshotLink(screenshotCode: string): string {
    return this.bungieUrl + screenshotCode;
  }

  createDamageTypeLink(iconCode: string): string {
    return this.bungieUrl + iconCode;
  }

  isArmor(item: Item): boolean {
    return item.item_type === 20;
  }

  isWeapon(item: Item): boolean {
    return item.item_type === 1;
  }

  goToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPlatformName(type: number) {
    return getPlatformName(type);
  }

  validateName(name: string): string {
    return name
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe')
      .replace(/ß/g, 'ss')
      .replace(/[^\w\s]/g, '')
      .toLowerCase();
  }

  isArmorLabel(name: string): boolean {
    return isArmorLabel(name);
  }

  isWeaponLabel(name: string): boolean {
    return isWeaponLabel(name);
  }
}
