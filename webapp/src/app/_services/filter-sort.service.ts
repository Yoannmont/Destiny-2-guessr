import { Injectable } from '@angular/core';
import { Filter } from '../_classes/filter';
import {
  ITEM_TYPE_LABELS,
  ItemOrdering,
  switchOrdering,
} from '../_classes/item';
import { UtilsService } from './utils.service';
import { LangService } from './lang.service';

@Injectable({
  providedIn: 'root',
})
export class FilterSortService {
  constructor(
    public utilsService: UtilsService,
    private langService: LangService
  ) {}

  searchTerm: string = '';
  fromAccount: boolean = false;

  sortOption: ItemOrdering = 'translations__name';
  sortAscending: boolean = false;

  filters: Array<Filter> = [];
  filterSidebarOpen: boolean = false;

  setSort(option: ItemOrdering): void {
    if (this.sortOption === option) {
      this.sortAscending = !this.sortAscending;
      this.sortOption = switchOrdering(option);
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
    const isWeaponOrArmorFilter = this.LOCALIZED_ITEM_TYPES.filter(
      (reducedLabel) => reducedLabel['localized_item_type'] === label
    );
    if (filter.property === 'category' && isWeaponOrArmorFilter.length !== 0) {
      filter.property = 'item_type';
      filter.value = isWeaponOrArmorFilter[0].id.toString();
    }
    const foundFilter = this.filters.find(
      (_filter) =>
        _filter.property === filter.property && _filter.value === filter.value
    );
    if (!foundFilter) {
      this.filters.push(filter);
    }
    console.log(this.filters);
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
}
