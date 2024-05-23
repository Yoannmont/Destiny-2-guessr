import { Injectable } from '@angular/core';
import { Category, DamageType, Tier, Type, Weapon } from '../_classes/weapon';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CollectiblesCacheService {

  private weaponsCache: Map<string, Weapon[]> = new Map();
  private typesCache: Type[] | null = null;
  private tiersCache: Tier[] | null = null;
  private categoriesCache: Category[] | null = null;
  private damageTypesCache: DamageType[] | null = null;

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
    // Vérifier d'abord si l'arme est dans le cache
    const cachedWeapons = Array.from(this.weaponsCache.values()).flat();
    const cachedWeapon = cachedWeapons.find(weapon => weapon.id === id);
    
    if (cachedWeapon) {
      // Retourner l'arme du cache si elle est disponible
      return of(cachedWeapon);
    } else {
      // Sinon, effectuer la requête HTTP pour récupérer l'arme
      return this.httpClient
        .get<Weapon>(`${this.BASE_URL}/getSingleWeapon/${id}/`)
        .pipe(
          tap(weapon => {
            // Mettre en cache l'arme récupérée
            this.weaponsCache.set(`weapon_${id}`, [weapon]);
          }),
          catchError(this.handleError)
        );
    }
  }
  

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
