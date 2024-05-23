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

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, RouterModule, FilterPipe],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit, OnDestroy {
  weapons!: Weapon[];
  filteredWeapons: Weapon[] = [];

  destroy: Subject<boolean>;

  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];

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
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getTypes();
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
    this.filteredWeapons = this.weapons.filter((weapon: any) => {
      // Regrouper les filtres par propriété
      const groupedFilters = this.groupFiltersByProperty();

      // Vérifier si l'arme correspond à au moins un des filtres pour chaque propriété
      return Object.keys(groupedFilters).every((property: any) => {
        const filtersForProperty = groupedFilters[property];
        return filtersForProperty.some((filter: any) => {
          return (
            weapon.hasOwnProperty(filter.property) &&
            weapon[filter.property] === filter.value
          );
        });
      });
    });
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
    this.filteredWeapons = this.weapons;
    this.filters = [];
  }

  deleteFilter(filter: Filter): void {
    const index = this.filters.findIndex((_filter) => _filter === filter);
    this.filters.splice(index, 1);
  }

  getWeapons(): void {
    this.collectiblesCacheService
      .getAllWeapons('')
      .pipe(takeUntil(this.destroy))
      .subscribe((weapons: Weapon[]) => {
        this.weapons = weapons;
        this.filteredWeapons = weapons;
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

  ngOnDestroy(): void {
    this.destroy.next(true);
  }
}
