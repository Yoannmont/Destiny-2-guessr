import { Injectable } from '@angular/core';
import { Category, DamageType, Tier, Type, Weapon } from '../_classes/weapon';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Armor, Class, ObjectType } from '../_classes/armor';
import { Collectible } from '../_classes/collectible';
@Injectable({
  providedIn: 'root'
})
export class CollectiblesCacheService {
  private weaponsCache: Map<string, Weapon[]> = new Map();
  private armorsCache: Map<string, Armor[]> = new Map();
  private typesCache: Type[] | null = null;
  private tiersCache: Tier[] | null = null;
  private categoriesCache: Category[] | null = null;
  private damageTypesCache: DamageType[] | null = null;
  private objectsCache: ObjectType[] | null = null;
  private classesCache: Class[] | null = null;

  private readonly BASE_URL = environment.SERVER_BASE_URL;

  constructor(private httpClient: HttpClient) { }

  getAllTypes(): Observable<Type[]> {
    if (this.typesCache) {
      return of(this.typesCache);
    } else {
      return this.httpClient
        .get<Type[]>(this.BASE_URL + '/getAllTypes/')
        .pipe(
          tap(types => this.typesCache = types),
          catchError(this.handleError)
        );
    }
  }

  getAllTiers(): Observable<Tier[]> {
    if (this.tiersCache) {
      return of(this.tiersCache);
    } else {
      return this.httpClient
        .get<Tier[]>(this.BASE_URL + '/getAllTiers/')
        .pipe(
          tap(tiers => this.tiersCache = tiers),
          catchError(this.handleError)
        );
    }
  }

  getAllCategories(): Observable<Category[]> {
    if (this.categoriesCache) {
      return of(this.categoriesCache);
    } else {
      return this.httpClient
        .get<Category[]>(this.BASE_URL + '/getAllCategories/')
        .pipe(
          tap(categories => this.categoriesCache = categories),
          catchError(this.handleError)
        );
    }
  }

  getAllDamageTypes(): Observable<DamageType[]> {
    if (this.damageTypesCache) {
      return of(this.damageTypesCache);
    } else {
      return this.httpClient
        .get<DamageType[]>(this.BASE_URL + '/getAllDamageTypes/')
        .pipe(
          tap(damageTypes => this.damageTypesCache = damageTypes),
          catchError(this.handleError)
        );
    }
  }

  getAllWeapons(lang: string): Observable<Weapon[]> {
    const cacheKey = `weapons_${lang}`;
    if (this.weaponsCache.has(cacheKey)) {
      return of(this.weaponsCache.get(cacheKey)!);
    } else {
      return this.httpClient
        .get<Weapon[]>(this.BASE_URL + '/getWeapons/', { params: { lang }})
        .pipe(
          tap(weapons => this.weaponsCache.set(cacheKey, weapons)),
          catchError(this.handleError)
        );
    }
  }

  getSingleWeapon(id: number): Observable<Weapon> {
    const cachedWeapons = Array.from(this.weaponsCache.values()).flat();
    const cachedWeapon = cachedWeapons.find(weapon => weapon.id === id);
    
    if (cachedWeapon) {
      return of(cachedWeapon);
    } else {
      return this.httpClient
        .get<Weapon>(`${this.BASE_URL}/getSingleWeapon/${id}/`)
        .pipe(
          tap(weapon => {
            const lang = 'en';
            const cacheKey = `weapons_${lang}`;
            const currentCache = this.weaponsCache.get(cacheKey) || [];
            this.weaponsCache.set(cacheKey, [...currentCache, weapon]);
          }),
          catchError(this.handleError)
        );
    }
  }

  getAllArmors(lang: string): Observable<Armor[]> {
    const cacheKey = `armors_${lang}`;
    if (this.armorsCache.has(cacheKey)) {
      return of(this.armorsCache.get(cacheKey)!);
    } else {
      return this.httpClient
        .get<Armor[]>(this.BASE_URL + '/getArmors/', { params: { lang }})
        .pipe(
          tap(armors => this.armorsCache.set(cacheKey, armors)),
          catchError(this.handleError)
        );
    }
  }

  getSingleArmor(id: number): Observable<Armor> {
    const cachedArmors = Array.from(this.armorsCache.values()).flat();
    const cachedArmor = cachedArmors.find(armor => armor.id === id);
    
    if (cachedArmor) {
      return of(cachedArmor);
    } else {
      return this.httpClient
        .get<Armor>(`${this.BASE_URL}/getSingleArmor/${id}/`)
        .pipe(
          tap(armor => {
            const lang = 'en';
            const cacheKey = `armors_${lang}`;
            const currentCache = this.armorsCache.get(cacheKey) || [];
            this.armorsCache.set(cacheKey, [...currentCache, armor]);
          }),
          catchError(this.handleError)
        );
    }
  }

  getAllObjects(): Observable<ObjectType[]> {
    if (this.objectsCache) {
      return of(this.objectsCache);
    } else {
      return this.httpClient
        .get<ObjectType[]>(this.BASE_URL + '/getAllObjectTypes/')
        .pipe(
          tap(objects => this.objectsCache = objects),
          catchError(this.handleError)
        );
    }
  }

  getAllClasses(): Observable<Class[]> {
    if (this.classesCache) {
      return of(this.classesCache);
    } else {
      return this.httpClient
        .get<Class[]>(this.BASE_URL + '/getAllClasses/')
        .pipe(
          tap(classes => this.classesCache = classes),
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

  


}
