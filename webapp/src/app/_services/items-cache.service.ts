import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  EMPTY,
  expand,
  map,
  Observable,
  of,
  reduce,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Category,
  ClassType,
  DamageType,
  Item,
  item_filter_to_request,
  ItemFilter,
  ItemOrdering,
  Tier,
} from '../_classes/item';
@Injectable({
  providedIn: 'root',
})
export class ItemsCacheService {
  private itemsCache: Map<string, Item[]> = new Map();
  private tiersCache: Map<string, Tier[]> = new Map();
  private categoriesCache: Map<string, Category[]> = new Map();
  private damageTypesCache: Map<string, DamageType[]> = new Map();
  private classTypesCache: Map<string, ClassType[]> = new Map();

  private readonly BASE_URL = environment.SERVER_BASE_URL + '/d2g';
  readonly timeoutDuration: number = 65000;

  constructor(private httpClient: HttpClient) {}

  getAllTiers(lang: string = 'en'): Observable<Tier[]> {
    const cacheKey = `tiers_${lang}`;
    if (this.tiersCache.get(cacheKey)) {
      return of(this.tiersCache.get(cacheKey)!);
    } else {
      return this.fetchAllPaginated<Tier>(
        this.BASE_URL + '/api/v1/tier-types/',
        { lang }
      ).pipe(tap((tiers) => this.tiersCache.set(cacheKey, tiers)));
    }
  }

  getAllCategories(lang: string = 'en'): Observable<Category[]> {
    const cacheKey = `categories_${lang}`;
    if (this.categoriesCache.has(cacheKey)) {
      return of(this.categoriesCache.get(cacheKey)!);
    } else {
      return this.fetchAllPaginated<Category>(
        this.BASE_URL + '/api/v1/categories/',
        { lang }
      ).pipe(
        tap((categories) => this.categoriesCache.set(cacheKey, categories))
      );
    }
  }

  getAllDamageTypes(lang: string = 'en'): Observable<DamageType[]> {
    const cacheKey = `damageTypes_${lang}`;
    if (this.damageTypesCache.has(cacheKey)) {
      return of(this.damageTypesCache.get(cacheKey)!);
    } else {
      return this.fetchAllPaginated<DamageType>(
        this.BASE_URL + '/api/v1/damage-types/',
        { lang }
      ).pipe(
        tap((damageTypes) => this.damageTypesCache.set(cacheKey, damageTypes))
      );
    }
  }

  getAllItems(
    lang: string = 'en',
    item_filters: ItemFilter = {},
    ordering: ItemOrdering = 'translations__name'
  ): Observable<Item[]> {
    const initialUrl = this.BASE_URL + '/api/v1/items/';
    const requestFilters = item_filter_to_request(item_filters);
    const params: any = { lang, ...requestFilters, ordering };

    return this.fetchAllPaginated<Item>(initialUrl, params);
  }

  getItemsFromPage(
    page: number,
    lang: string = 'en',
    item_filters: ItemFilter,
    ordering: ItemOrdering = 'translations__name',
    search = '',
    page_size = 42
  ): Observable<Item[]> {
    const url = `${this.BASE_URL}/api/v1/items/`;
    const filterParams = item_filter_to_request(item_filters);

    const params: any = {
      lang,
      page: page.toString(),
      ...filterParams,
      ordering,
      page_size,
    };
    if (search !== '') {
      params.search = search;
    }

    return this.httpClient
      .get<any>(url, { params })
      .pipe(catchError(this.handleError));
  }

  getAllClassTypes(lang: string = 'en'): Observable<ClassType[]> {
    const cacheKey = `classType_${lang}`;
    if (this.classTypesCache.has(cacheKey)) {
      return of(this.classTypesCache.get(cacheKey)!);
    } else {
      return this.fetchAllPaginated<ClassType>(
        this.BASE_URL + '/api/v1/class-types/',
        { lang }
      ).pipe(
        tap((classTypes) => this.classTypesCache.set(cacheKey, classTypes))
      );
    }
  }

  getSingleItem(id: number, lang: string = 'en'): Observable<Item> {
    const cachedItems = Array.from(this.itemsCache.values()).flat();
    const cachedItem = cachedItems.find((weapon) => weapon.id === id);

    if (cachedItem && cachedItem.screenshot_url) {
      return of(cachedItem);
    } else {
      return this.httpClient
        .get<Item>(`${this.BASE_URL}/api/v1/items/${id}/`, { params: { lang } })
        .pipe(
          tap((item: Item) => {
            const cacheKey = `items_${lang}`;
            let currentCache = this.itemsCache.get(cacheKey) || [];
            currentCache = currentCache.filter((weapon) => weapon.id !== id);
            this.itemsCache.set(cacheKey, [...currentCache, item]);
          }),
          catchError(this.handleError)
        );
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

  private fetchAllPaginated<T>(url: string, params?: any): Observable<T[]> {
    return this.httpClient.get<any>(url, { params }).pipe(
      expand((response) => {
        let nextUrl = undefined;
        if (response.next) {
          nextUrl = response.next;
        }

        return nextUrl ? this.httpClient.get<any>(nextUrl) : EMPTY;
      }),
      map(this.getResults),
      reduce((acc, items) => acc.concat(items), [] as T[]),
      catchError(this.handleError)
    );
  }

  getResults(response: any) {
    return response.results || [];
  }
}
