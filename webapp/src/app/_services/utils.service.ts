import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  sidebarLayout!: BehaviorSubject<boolean>;
  isSidebarVisible: boolean = true;

  public readonly navbarContent = [
    { title: $localize`Exo Challenge`, link: 'exo-challenge/' },
    { title: $localize`Arme mystère`, link: 'mystery-weapon/' },
    { title: $localize`Collections`, link: 'collections/' },
  ];

  public bungieUrl = 'https://bungie.net';

  public iconsPath = "/common/destiny2_content/icons/"
  public screenshotPath = "/common/destiny2_content/screenshots/"
  constructor() {
    this.sidebarLayout = new BehaviorSubject<boolean>(false);
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  reloadPage():void{
    location.reload();
  }

  
}
