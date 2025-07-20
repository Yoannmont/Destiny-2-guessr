import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  EMPTY,
  expand,
  map,
  Observable,
  of,
  reduce,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Membership, ShortMembership } from '../_classes/membership';
import {
  Item,
  item_filter_to_request,
  ItemFilter,
  ItemOrdering,
} from '../_classes/item';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accountItemsCache: Map<string, Item[]> = new Map();
  private _account?: ShortMembership;
  constructor(private httpClient: HttpClient) {}

  private readonly BASE_URL = environment.SERVER_BASE_URL + '/d2g';

  startBungieLogin(): void {
    window.location.href = this.BASE_URL + '/login/bungie/';
  }

  lockAccount(membership: ShortMembership): void {
    this._account = membership;
  }

  get currentAccount() {
    return this._account;
  }

  removeAccount(): void {
    this._account = undefined;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  removeAccessToken(): void {
    localStorage.removeItem('access_token');
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;
    return Date.now() / 1000 >= expiry;
  }

  logout(): Observable<any> {
    return this.httpClient.post<any>(
      this.BASE_URL + '/auth/logout/',
      {},
      { withCredentials: true }
    );
  }

  initializeSession(): void {
    const accessToken = this.getAccessToken();

    let refresh$: Observable<string | null>;

    if (!accessToken || this.isTokenExpired(accessToken)) {
      refresh$ = this.httpClient
        .post<any>(this.BASE_URL + '/token/refresh/', {
          withCredentials: true,
        })
        .pipe(
          map((res) => {
            localStorage.setItem('access_token', res.access);
            return res.access;
          }),
          catchError((err) => {
            console.warn('Refresh failed', err);
            return of(null);
          })
        );
    } else {
      refresh$ = of(accessToken);
    }

    refresh$
      .pipe(
        switchMap((token) => {
          if (!token) return of(null);
          return of(this.getMembershipFromToken(token));
        })
      )
      .subscribe((membership) => {
        if (membership) {
          this.lockAccount(membership);
          console.log('>>> User connected:', this._account?.displayName);
        } else {
          console.log('>>> Not connected');
        }
      });
  }

  getMembershipFromToken(token: string): ShortMembership | null {
    if (token) {
      const membership_info = JSON.parse(atob(token.split('.')[1]));
      const membership: ShortMembership = {
        membershipId: membership_info.membership_id,
        membershipType: membership_info.membership_type,
        displayName: membership_info.display_name,
        lastAuthDate: membership_info.last_auth_date,
      };
      return membership;
    }
    return null;
  }

  getMemberships(): Observable<Membership[]> {
    return this.httpClient
      .get<any>(this.BASE_URL + '/select-membership/', {
        withCredentials: true,
      })
      .pipe(map((response) => response.memberships));
  }

  selectMembership(membership: Membership): Observable<any> {
    const data = {
      membership_id: membership.membershipId,
      membership_type: membership.membershipType,
      display_name: membership.displayName,
    };

    return this.httpClient
      .post<any>(this.BASE_URL + '/select-membership/', data, {
        withCredentials: true,
      })
      .pipe(
        map((response) => environment.SERVER_BASE_URL + response.redirect_url),

        catchError(this.handleError)
      );
  }

  refreshMembership(): void {
    // start an auth flow but with already connected user
    this.startBungieLogin();
  }

  getAccountItems(
    lang: string = 'en',
    membershipId: string
  ): Observable<Item[]> {
    const cacheKey = `account_item_${lang}_${membershipId}`;
    if (this.accountItemsCache.has(cacheKey)) {
      return of(this.accountItemsCache.get(cacheKey)!);
    } else {
      const initialUrl = this.BASE_URL + '/auth/account-items/';

      return this.fetchAllPaginated<Item>(initialUrl + membershipId + '/', {
        lang,
      }).pipe(
        tap((items) => {
          this.accountItemsCache.set(cacheKey, items);
        })
      );
    }
  }

  getAccountItemsFromPage(
    page: number,
    lang: string = 'en',
    membershipId: string,
    item_filters: ItemFilter,
    ordering: ItemOrdering = 'translations__name',
    search: string = '',
    page_size: number = 42
  ): Observable<Item[]> {
    const url = `${this.BASE_URL}/auth/account-items/${membershipId}/`;
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

  disconnectAccount(): Observable<any> {
    return this.httpClient
      .post<any>(this.BASE_URL + '/auth/disconnect-bungie-account/', {})
      .pipe(catchError(this.handleError));
  }

  private fetchAllPaginated<T>(url: string, params?: any): Observable<T[]> {
    return this.httpClient.get<any>(url, { params }).pipe(
      expand((response) => {
        let nextUrl = undefined;
        if (response.next) {
          nextUrl = response.next.replace(/^http:/, 'https:');
        }

        return nextUrl ? this.httpClient.get<any>(nextUrl) : EMPTY;
      }),
      map((response) => response.results || []),
      reduce((acc, items) => acc.concat(items), [] as T[]),
      catchError(this.handleError)
    );
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
