import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import { Filter } from '../../_classes/filter';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GamemodeService } from '../../_services/gamemode.service';
import { catchError, finalize, of, Subject, takeUntil, timeout } from 'rxjs';
import { LangService } from '../../_services/lang.service';
import {
  Category,
  ClassType,
  DamageType,
  Item,
  ITEM_TYPE_LABELS,
  ItemFilter,
  ItemOrdering,
  Tier,
  WEAPON_AMMO_TYPE_LABELS,
  WEAPON_SLOT_LABELS,
} from '../../_classes/item';
import { ItemsCacheService } from '../../_services/items-cache.service';
import { AuthService } from '../../_services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterSortService } from '../../_services/filter-sort.service';

@Component({
  selector: 'app-gamemode',
  imports: [CommonModule, FormsModule, NgbTooltipModule],
  templateUrl: './gamemode.component.html',
  styleUrl: './gamemode.component.scss',
})
export class GamemodeComponent implements OnInit {
  tiers!: Tier[];
  categories!: Category[];
  damageTypes!: DamageType[];
  accountItems!: Item[];
  classTypes!: ClassType[];

  filteredItems!: Item[];
  selectedItems: Item[] = [];

  pageSize: number = 100;
  page: number = 1;
  itemCount: number = 0;

  loading: boolean = true;
  timedOut: boolean = false;

  fromAccount = false;

  sortOption: ItemOrdering = 'translations__name';
  searchTerm: string = '';

  destroy: Subject<boolean>;
  activateAdvancedSettings: boolean = false;

  paginationArray: number[] = [];

  item_filters: ItemFilter = {};
  filterSidebarOpen: boolean = false;
  @ViewChild('filterSidebar') filterSidebarRef!: ElementRef;

  constructor(
    public utilsService: UtilsService,
    private gamemodeService: GamemodeService,
    private itemsCacheService: ItemsCacheService,
    private langService: LangService,
    private router: Router,
    private authService: AuthService,
    public filterSortService: FilterSortService
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
  }

  ngOnInit(): void {
    this.initItemFilters();
    this.getItems();
    this.getCategories();
    this.getTiers();
    this.getClassTypes();
    this.getDamageTypes();
    this.getAccountItems();
  }

  get totalPages(): number {
    return Math.floor(this.itemCount / this.pageSize);
  }

  saveSelectedItems(): void {
    this.gamemodeService.selectedItems = this.selectedItems;
  }

  initItemFilters(): void {
    this.filterSortService.filters = [
      { label: 'Exotic', property: 'tier_type', value: '2' },
    ];
    this.item_filters = {
      tier_type: [{ label: 'Exotic', property: 'tier_type', value: '2' }],
    };
  }

  saveAndLaunch(gamemode: 'exo-challenge' | 'mystery-weapon'): void {
    this.saveSelectedItems();
    this.router.navigate(['/gamemode', gamemode]);
  }

  getItems(
    page: number = this.page,
    item_filters: ItemFilter = this.item_filters,
    ordering: ItemOrdering = this.sortOption,
    searchTerm: string = ''
  ): void {
    this.itemsCacheService
      .getItemsFromPage(
        page,
        this.langService.currentLocaleID,
        item_filters,
        ordering,
        searchTerm,
        this.pageSize
      )
      .pipe(
        takeUntil(this.destroy),
        timeout(this.itemsCacheService.timeoutDuration),
        catchError(() => {
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response: any) => {
        this.itemCount = response.count;
        this.filteredItems = response.results;
        this.updatePaginationArray();
      });
  }

  updatePaginationArray() {
    const maxVisible = 9;
    const half = Math.floor(maxVisible / 2);
    const totalPages = this.totalPages;
    const currentPage = this.page;

    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }

    if (end > totalPages) {
      start -= end - totalPages;
      end = totalPages;
    }

    start = Math.max(1, start);

    this.paginationArray = [];
    for (let i = start; i <= end + 1; i++) {
      this.paginationArray.push(i);
    }
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

  get isConnected() {
    return !!this.authService.currentAccount;
  }

  getAccountItems(
    page: number = this.page,
    item_filters: ItemFilter = this.item_filters,
    ordering: ItemOrdering = this.sortOption,
    searchTerm: string = this.searchTerm
  ): void {
    if (this.authService.currentAccount) {
      this.authService
        .getAccountItemsFromPage(
          page,
          this.langService.currentLocaleID,
          this.authService.currentAccount.membershipId,
          item_filters,
          ordering,
          searchTerm
        )
        .subscribe((response: any) => {
          this.itemCount = response.count;
          this.filteredItems = response.results;
          this.fromAccount = true;
          this.updatePaginationArray();
        });
    } else {
      console.warn(">>> Couldn't fetch inventory: not connected");
    }
  }

  showAdvancedParameters(): void {
    const itemsSelectionModal = document.querySelector(
      '[data-bs-target="#itemsSelectionModal"]'
    ) as HTMLElement;
    itemsSelectionModal.click();
  }

  checkAdvancedParameters(): boolean {
    if (this.filteredItems.length === 0) {
      return false;
    }
    return true;
  }

  toggleItem(item: Item): void {
    const index = this.selectedItems.findIndex((i: Item) => i.id === item.id);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
  }

  isSelected(item: Item): boolean {
    return this.selectedItems.some((i) => i.id === item.id);
  }

  selectAllFiltered(): void {
    this.filteredItems.forEach((item) => {
      if (!this.isSelected(item)) {
        this.selectedItems.push(item);
      }
    });
  }

  unselectAllFiltered(): void {
    this.filteredItems.forEach((item) => {
      if (this.isSelected(item)) {
        this.selectedItems = this.selectedItems.filter(
          (i: Item) => i.id !== item.id
        );
      }
    });
  }

  setSort(option: ItemOrdering): void {
    this.filterSortService.setSort(option);
    this.applySorting();
  }

  addFilter(
    property: string,
    value: number | string,
    label: string | number
  ): void {
    this.filterSortService.addFilter(property, value, label);
  }
  deleteFilter(filter: Filter): void {
    this.filterSortService.deleteFilter(filter);
  }

  resetFilters(): void {
    this.filterSortService.resetFilters();
    this.item_filters = {};
    this.searchTerm = '';
    this.fromAccount = false;
    this.filterSortService.sortOption = this.sortOption = 'translations__name';
    this.getItems();
  }

  applyFilters() {
    this.page = 1;
    this.item_filters = this.filterSortService.groupFiltersByProperty();
    this.getItems();
  }

  applySorting(): void {
    this.page = 1;
    this.sortOption = this.filterSortService.sortOption;
    this.getItems();
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
  }

  onSearch(): void {
    const term = this.utilsService.validateName(this.searchTerm);
    if (!term || term.length < 3) {
      return;
    }
    this.page = 1;

    if (!this.fromAccount) {
      this.getItems(this.page, this.item_filters, this.sortOption, term);
    } else {
      this.getAccountItems(this.page, this.item_filters, this.sortOption, term);
    }
  }

  reloadItems(): void {
    if (this.fromAccount) {
      this.getAccountItems();
    } else {
      this.getItems();
    }
  }

  goToPage(p: number): void {
    if (p !== this.page) {
      this.page = p;
      this.reloadItems();
    }
  }

  get visibleItemsCount(): number {
    return Math.min(this.page * this.pageSize, this.itemCount);
  }

  nextPage() {
    if (this.page - 1 < this.totalPages) {
      this.page++;

      this.reloadItems();
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.reloadItems();
    }
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
