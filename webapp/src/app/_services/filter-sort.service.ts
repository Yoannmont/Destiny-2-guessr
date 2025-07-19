import { Injectable } from '@angular/core';
import { Filter } from '../_classes/filter';
import {
  Item,
  ITEM_TYPE_LABELS,
  WEAPON_SLOT_LABELS,
  WEAPON_AMMO_TYPE_LABELS,
  ItemOrdering,
  switchOrdering,
} from '../_classes/item';
import { UtilsService } from './utils.service';
import { LangService } from './lang.service';

@Injectable({
  providedIn: 'root',
})
export class FilterSortService {
  sortAscending: any;
  constructor(
    public utilsService: UtilsService,
    private langService: LangService
  ) {}

  searchTerm: string = '';
  fromAccount: boolean = false;

  sortOption: ItemOrdering = 'translations__name';

  filters: Array<Filter> = [];
  filterSidebarOpen: boolean = false;

  setSort(option: ItemOrdering): void {
    if (this.sortOption === option) {
      if (this.sortOption.charAt(0) == '-') {
        this.sortOption = switchOrdering(option);
      }
    } else {
      this.sortOption = option;
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

  groupFiltersByProperty(): any {
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
