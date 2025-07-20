import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  catchError,
  finalize,
  of,
  Subject,
  takeUntil,
  timeout,
  timer,
} from 'rxjs';
import { UtilsService } from '../../_services/utils.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { Filter } from '../../_classes/filter';
import { LangService } from '../../_services/lang.service';
import {
  Category,
  ClassType,
  DamageType,
  Item,
  ITEM_TYPE_LABELS,
  ItemFilter,
  ItemOrdering,
  slugify,
  Tier,
  WEAPON_AMMO_TYPE_LABELS,
  WEAPON_SLOT_LABELS,
} from '../../_classes/item';
import { ItemsCacheService } from '../../_services/items-cache.service';
import { AuthService } from '../../_services/auth.service';
import { FormsModule } from '@angular/forms';
import { FilterSortService } from '../../_services/filter-sort.service';

@Component({
  selector: 'app-collections',
  imports: [CommonModule, RouterModule, FilterPipe, FormsModule],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit, OnDestroy {
  allItems!: Item[];
  accountItems!: Item[];
  fromAccount: boolean = false;
  filteredItems: Item[] = [];

  pageSize: number = 42;
  page: number = 1;
  paginationArray: number[] = [];
  itemCount: number = 0;
  sortOption: ItemOrdering = 'translations__name';

  loading: boolean = true;
  timedOut: boolean = false;

  @ViewChild('filterSidebar') filterSidebarRef!: ElementRef;

  searchTerm: string = '';

  destroy: Subject<boolean>;

  tiers!: Tier[];
  categories!: Category[];
  damageTypes!: DamageType[];
  classTypes!: ClassType[];

  item_filters: ItemFilter = {};
  filterSidebarOpen: boolean = false;

  constructor(
    private itemsCacheService: ItemsCacheService,
    public utilsService: UtilsService,
    public langService: LangService,
    private authService: AuthService,
    public filterSortService: FilterSortService
  ) {
    this.destroy = new Subject<boolean>();
    this.utilsService.sidebarLayout.next(false);
  }

  ngOnInit(): void {
    timer(this.itemsCacheService.timeoutDuration).subscribe(() => {
      if (this.loading) {
        this.timedOut = true;
        this.loading = false;
      }
    });

    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getItems(1, this.item_filters);
    this.getClassTypes();
    this.getAccountItems();
  }

  get totalPages(): number {
    return Math.floor(this.itemCount / this.pageSize);
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
    for (let i = start; i <= end; i++) {
      this.paginationArray.push(i);
    }
  }

  goToPage(p: number): void {
    if (p !== this.page) {
      this.page = p;
      this.utilsService.goToTop();
      this.reloadItems();
    }
  }

  get visibleItemsCount(): number {
    return Math.min(this.page * this.pageSize, this.itemCount);
  }

  nextPage() {
    if (this.page - 1 < this.totalPages) {
      this.page++;
      this.utilsService.goToTop();
      this.reloadItems();
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.utilsService.goToTop();
      this.reloadItems();
    }
  }

  setSort(option: ItemOrdering): void {
    this.filterSortService.setSort(option);
    this.applySorting();
  }

  addFilter(
    property:
      | 'tier_type'
      | 'category'
      | 'default_damage_type'
      | 'class_type'
      | 'weapon_ammo_type'
      | 'weapon_slot',
    value: string,
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
    this.reloadItems();
  }

  reloadItems(): void {
    if (this.fromAccount) {
      this.getAccountItems();
    } else {
      this.getItems();
    }
  }

  applyFilters() {
    this.page = 1;
    this.item_filters = this.filterSortService.groupFiltersByProperty();
    this.reloadItems();
  }

  applySorting(): void {
    this.page = 1;
    this.sortOption = this.filterSortService.sortOption;
    this.reloadItems();
  }

  get isConnected() {
    return !!this.authService.currentAccount;
  }

  getAccountItems(page: number = this.page): void {
    if (!this.fromAccount) {
      if (this.authService.currentAccount) {
        this.authService
          .getAccountItemsFromPage(
            page,
            this.langService.currentLocaleID,
            this.authService.currentAccount.membershipId,
            this.item_filters,
            this.sortOption,
            this.searchTerm
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
    } else {
      this.fromAccount = false;
    }
  }

  getItems(
    page: number = this.page,
    item_filters: ItemFilter = this.item_filters,
    ordering: ItemOrdering = this.sortOption,
    searchTerm: string = this.searchTerm
  ): void {
    const term = this.utilsService.validateName(searchTerm);
    this.itemsCacheService
      .getItemsFromPage(
        page,
        this.langService.currentLocaleID,
        item_filters,
        ordering,
        term
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

  getSingleItemRoute(item: Item): string {
    return `${item.id}/${slugify(item.api_name)}`;
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.filterSidebarOpen &&
      this.filterSidebarRef &&
      !this.filterSidebarRef.nativeElement.contains(event.target)
    ) {
      // this.filterSidebarOpen = false;
    }
  }

  onSearch(): void {
    const term = this.utilsService.validateName(this.searchTerm);
    if (!term || term.length < 3) {
      return;
    }
    this.page = 1;

    if (this.fromAccount) {
      this.getItems(this.page, this.item_filters, this.sortOption, term);
    } else {
      this.getAccountItems(this.page);
    }
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
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
