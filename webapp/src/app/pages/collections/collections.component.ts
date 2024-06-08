import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  Category,
  DamageType,
  Tier,
  Type,
  Weapon,
} from '../../_classes/weapon';
import { Subject, takeUntil } from 'rxjs';
import { UtilsService } from '../../_services/utils.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { Filter } from '../../_classes/filter';
import { LangService } from '../../_services/lang.service';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { Armor, Class, ObjectType } from '../../_classes/armor';
import { Collectible } from '../../_classes/collectible';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, RouterModule, FilterPipe],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit, OnDestroy {
  weapons!: Weapon[];
  filteredCollectibles: Collectible[] = [];

  destroy: Subject<boolean>;

  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];
  objects!: ObjectType[];
  classes!: Class[];
  armors!: Armor[];

  filters: Array<Filter> = [];

  constructor(
    private collectiblesCacheService: CollectiblesCacheService,
    public utilsService: UtilsService,
    public langService: LangService
  ) {
    this.destroy = new Subject<boolean>();
    this.utilsService.sidebarLayout.next(false);
  }

  ngOnInit(): void {
    this.getWeapons();
    this.getArmors();
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getTypes();
    this.getObjects();
    this.getClasses();
  }

  localizeProperty(property: string): string {
    return this.langService.localizeProperty(property);
  }

  addFilter(property: string, value: any, label: string | number): void {
    const filter = { property: property, value: value, label: label };
    const foundFilter = this.filters.find(
      (_filter) =>
        _filter.property === filter.property && _filter.value === filter.value
    );
    if (!foundFilter) this.filters.push(filter);
  }

  applyFilters() {
    let collectibles: Collectible[] = this.weapons;
    collectibles = collectibles.concat(this.armors);
    this.filteredCollectibles = collectibles.filter(
      (collectible: Collectible) => {
        const groupedFilters = this.groupFiltersByProperty();

        return Object.keys(groupedFilters).every((property: any) => {
          const filtersForProperty = groupedFilters[property];
          return filtersForProperty.some((filter: any) => {
            return (
              collectible.hasOwnProperty(filter.property) &&
              collectible[filter.property] === filter.value
            );
          });
        });
      }
    );
  }

  groupFiltersByProperty(): Array<any> {
    const groupedFilters: any = {};
    this.filters.forEach((filter: any) => {
      if (!groupedFilters[filter.property]) {
        groupedFilters[filter.property] = [];
      }
      groupedFilters[filter.property].push(filter);
    });
    return groupedFilters;
  }

  resetFilters(): void {
    this.filteredCollectibles = [];
    this.filteredCollectibles = this.filteredCollectibles.concat(this.weapons);
    this.filteredCollectibles = this.filteredCollectibles.concat(this.armors);
    this.filters = [];
  }

  deleteFilter(filter: Filter): void {
    const index = this.filters.findIndex((_filter) => _filter === filter);
    this.filters.splice(index, 1);
  }

  getWeapons(): void {
    this.collectiblesCacheService
      .getAllWeapons(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((weapons: Weapon[]) => {
        this.weapons = weapons;
        this.filteredCollectibles = this.filteredCollectibles.concat(weapons);
      });
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

  getArmors(): void {
    this.collectiblesCacheService
      .getAllArmors(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((armors: Armor[]) => {
        this.armors = armors;
        this.filteredCollectibles = this.filteredCollectibles.concat(armors);
      });
  }

  getSingleCollectibleRoute(collectible : Collectible) : string{
    if (collectible.objectType === 1){
      return `weapons/${collectible.id}`;
    }
    else{
      return `armor/${collectible.id}`;
    }
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }
}
