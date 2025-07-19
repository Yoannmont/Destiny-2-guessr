import { Injectable } from '@angular/core';
import { Filter } from '../_classes/filter';
import {
  Item,
  ITEM_TYPE_LABELS,
  WEAPON_SLOT_LABELS,
  WEAPON_AMMO_TYPE_LABELS,
} from '../_classes/item';
import { UtilsService } from './utils.service';
import { LangService } from './lang.service';

@Injectable({
  providedIn: 'root',
})
export class FilterSortServiceService {
  constructor(
    public utilsService: UtilsService,
    private langService: LangService
  ) {}

  searchTerm: string = '';
  fromAccount: boolean = false;

  sortAscending: boolean = true;
  sortOption: string = 'alphabetical';

  filters: Array<Filter> = [];
  filterSidebarOpen: boolean = false;

  setSort(option: string): void {
    if (this.sortOption === option) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortOption = option;
      this.sortAscending = true;
    }
  }

  addFilter(
    property: string,
    value: number | string,
    label: string | number
  ): Filter[] {
    const filter = { property: property, value: value, label: label };
    const foundFilter = this.filters.find(
      (_filter) =>
        _filter.property === filter.property && _filter.value === filter.value
    );
    if (!foundFilter) {
      this.filters.push(filter);
    }
    return this.filters;
  }
  deleteFilter(filter: Filter): Filter[] {
    const index = this.filters.findIndex((_filter) => _filter === filter);
    this.filters.splice(index, 1);
    return this.filters;
  }
  resetFilters(): void {
    this.filters = [];
    this.searchTerm = '';
    this.fromAccount = false;
  }

  applyFilters(sourceItems: Item[]): Item[] {
    const filteredItems = sourceItems.filter((item: Item) => {
      const groupedFilters = this.groupFiltersByProperty();

      return Object.keys(groupedFilters).every((property: any) => {
        const filtersForProperty = groupedFilters[property];
        return filtersForProperty.some(
          (filter: {
            property: string;
            value: string | number;
            label: string | number;
          }) => {
            if (this.utilsService.isArmorLabel(<string>filter.label)) {
              return this.utilsService.isArmor(item);
            }
            if (this.utilsService.isWeaponLabel(<string>filter.label)) {
              return this.utilsService.isWeapon(item);
            }
            return (
              item.hasOwnProperty(filter.property) &&
              item[filter.property] === filter.value
            );
          }
        );
      });
    });
    return filteredItems;
  }

  applySorting(filteredItems: Item[]): Item[] {
    if (!filteredItems) return [];

    const direction = this.sortAscending ? 1 : -1;

    filteredItems.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (this.sortOption) {
        case 'alphabetical':
          aVal = a.localized_name;
          bVal = b.localized_name;
          break;
        case 'default_damage_type':
          aVal = a.default_damage_type ?? Number.POSITIVE_INFINITY;
          bVal = b.default_damage_type ?? Number.POSITIVE_INFINITY;
          break;
        case 'tier_type':
          aVal = a.tier_type ?? Number.POSITIVE_INFINITY;
          bVal = b.tier_type ?? Number.POSITIVE_INFINITY;
          break;
        case 'item_type':
          aVal = a.item_type ?? Number.POSITIVE_INFINITY;
          bVal = b.item_type ?? Number.POSITIVE_INFINITY;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }

      return (aVal - bVal) * direction;
    });
    return filteredItems;
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

  get LOCALIZED_ITEM_TYPES() {
    return this.langService.reduceLabels(
      ITEM_TYPE_LABELS,
      'localized_item_type'
    );
  }

  get LOCALIZED_WEAPON_SLOTS() {
    return this.langService.reduceLabels(
      WEAPON_SLOT_LABELS,
      'localized_weapon_slot'
    );
  }

  get LOCALIZED_WEAPON_AMMO_TYPES() {
    return this.langService.reduceLabels(
      WEAPON_AMMO_TYPE_LABELS,
      'localized_weapon_ammo_type'
    );
  }
}
