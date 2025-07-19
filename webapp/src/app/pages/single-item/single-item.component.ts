import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { LangService } from '../../_services/lang.service';
import { UtilsService } from '../../_services/utils.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import {
  Category,
  ClassType,
  DamageType,
  Item,
  Tier,
} from '../../_classes/item';
import { ItemsCacheService } from '../../_services/items-cache.service';

@Component({
  selector: 'app-single-item',
  templateUrl: './single-item.component.html',
  styleUrl: './single-item.component.scss',
  imports: [RouterModule, CommonModule, FilterPipe],
})
export class SingleItemComponent implements OnInit, OnDestroy {
  item!: Item;
  destroy: Subject<boolean>;

  tiers!: Tier[];
  categories!: Category[];
  damageTypes!: DamageType[];
  imgLoaded: boolean = false;
  classTypes!: ClassType[];

  constructor(
    private route: ActivatedRoute,
    public itemsCacheService: ItemsCacheService,
    private langService: LangService,
    public utilsService: UtilsService
  ) {
    this.destroy = new Subject<boolean>();
    this.utilsService.sidebarLayout.next(false);
  }
  ngOnInit(): void {
    const itemId = +this.route.snapshot.params['id'];
    this.getItem(itemId);
    this.getTiers();
    this.getCategories();
    this.getDamageTypes();
    this.getClassTypes();
  }

  getItem(id: number): void {
    this.itemsCacheService
      .getSingleItem(id, this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((item: Item) => {
        this.item = item;
      });
  }

  getDamageTypes(): void {
    this.itemsCacheService
      .getAllDamageTypes(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((damageTypes: DamageType[]) => {
        this.damageTypes = damageTypes;
      });
  }

  getTiers(): void {
    this.itemsCacheService
      .getAllTiers(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((tiers: Tier[]) => {
        this.tiers = tiers;
      });
  }

  getCategories(): void {
    this.itemsCacheService
      .getAllCategories(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((categories: Category[]) => {
        this.categories = categories;
      });
  }

  getClassTypes(): void {
    this.itemsCacheService
      .getAllClassTypes(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((classTypes: ClassType[]) => {
        this.classTypes = classTypes;
      });
  }

  openViewerModal(): void {
    const viewerModal = document.querySelector(
      '[data-bs-target="#itemViewer"]'
    ) as HTMLElement;
    viewerModal.click();
  }

  getCategoryImgPath(currentItem: Item): string | null {
    const basePath = 'assets/img/';
    const subPath = this.utilsService.isWeapon(currentItem)
      ? 'weapon_categories/'
      : 'armor_categories/';

    const categoryObj = this.categories.find(
      (c) => c.id === currentItem.category
    );
    let fileName: string;
    // Grenade launchers case
    if (categoryObj?.name === 'Grenade Launchers') {
      const isHeavy = currentItem.weapon_ammo_type === 3 ? '_heavy' : '';
      fileName = categoryObj?.id_bungie + isHeavy + '.svg';
    } else {
      fileName = categoryObj?.id_bungie + '.svg';
    }

    const fullPath = basePath + subPath + fileName;

    return fullPath;
  }

  getClassTypeImgPath(currentItem: Item): string | null {
    const basePath = 'assets/img/class_types/';

    const classTypeObj = this.classTypes.find(
      (c) => c.id === currentItem.class_type
    );
    const fileName = classTypeObj?.id_bungie + '.svg';

    const fullPath = basePath + fileName;

    return fullPath;
  }

  getAmmoTypeImgPath(currentItem: Item): string | null {
    const basePath = 'assets/img/ammo_types/';

    const fileName = currentItem.weapon_ammo_type + '.svg';

    const fullPath = basePath + fileName;

    return fullPath;
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }
}
