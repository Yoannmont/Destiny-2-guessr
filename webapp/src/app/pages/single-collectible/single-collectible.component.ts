import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  Category,
  DamageType,
  Tier,
  Type,
  Weapon,
} from '../../_classes/weapon';

import { Subject, takeUntil } from 'rxjs';
import { LangService } from '../../_services/lang.service';
import { UtilsService } from '../../_services/utils.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { Collectible } from '../../_classes/collectible';
import { Armor, Class, ObjectType } from '../../_classes/armor';

@Component({
  selector: 'app-single-collectible',
  standalone: true,
  templateUrl: './single-collectible.component.html',
  styleUrl: './single-collectible.component.scss',
  imports: [RouterModule, CommonModule, FilterPipe],
})
export class SingleCollectibleComponent implements OnInit, OnDestroy {
  collectible!: Weapon | Armor;
  destroy: Subject<boolean>;

  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];
  objects!: ObjectType[];
  classes! : Class[];

  constructor(
    private route: ActivatedRoute,
    public collectiblesCacheService: CollectiblesCacheService,
    private langService: LangService,
    public utilsService: UtilsService
  ) {
    this.destroy = new Subject<boolean>();
    this.utilsService.sidebarLayout.next(false);
  }
  ngOnInit(): void {
    const collectibleType = this.route.snapshot.params['collectible'];
    const collectibleId = +this.route.snapshot.params['id'];
    this.getCollectible(collectibleType, collectibleId);
    this.getTiers();
    this.getCategories();
    this.getDamageTypes();
    this.getTypes();
    this.getObjects();
    this.getClasses();
  }

  getCollectible(collectibleType: string, collectibleId: number): void {
    if (collectibleType === 'weapon') {
      this.collectiblesCacheService
        .getSingleWeapon(collectibleId)
        .pipe(takeUntil(this.destroy))
        .subscribe((collectible: Weapon) => {
          this.collectible = collectible;
        });
    } else {
      this.collectiblesCacheService
        .getSingleArmor(collectibleId)
        .pipe(takeUntil(this.destroy))
        .subscribe((collectible: Armor) => {
          this.collectible = collectible;
        });
    }
  }

  localizeProperty(property: string): string {
    return this.langService.localizeProperty(property);
  }

  getTypes(): void {
    this.collectiblesCacheService
      .getAllTypes()
      .pipe(takeUntil(this.destroy))
      .subscribe((types: Type[]) => {
        this.types = types;
      });
  }

  getDamageTypes(): void {
    this.collectiblesCacheService
      .getAllDamageTypes()
      .pipe(takeUntil(this.destroy))
      .subscribe((damageTypes: DamageType[]) => {
        this.damageTypes = damageTypes;
      });
  }

  getTiers(): void {
    this.collectiblesCacheService
      .getAllTiers()
      .pipe(takeUntil(this.destroy))
      .subscribe((tiers: Tier[]) => {
        this.tiers = tiers;
      });
  }

  getCategories(): void {
    this.collectiblesCacheService
      .getAllCategories()
      .pipe(takeUntil(this.destroy))
      .subscribe((categories: Category[]) => {
        this.categories = categories;
      });
  }

  getObjects(): void {
    this.collectiblesCacheService
      .getAllObjects()
      .pipe(takeUntil(this.destroy))
      .subscribe((objects: ObjectType[]) => {
        this.objects = objects;
      });
  }

  getClasses(): void {
    this.collectiblesCacheService
      .getAllClasses()
      .pipe(takeUntil(this.destroy))
      .subscribe((classes: Class[]) => {
        this.classes = classes;
      });
  }


  ngOnDestroy(): void {
    this.destroy.next(true);
  }
}
