import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { getPlatformName } from '../../_classes/platform';
import { UtilsService } from '../../_services/utils.service';
import { Membership } from '../../_classes/membership';
import { catchError, finalize, of, timeout, timer } from 'rxjs';
import { ItemsCacheService } from '../../_services/items-cache.service';

@Component({
  selector: 'app-select-membership',
  imports: [CommonModule, RouterModule],
  templateUrl: './select-membership.component.html',
  styleUrl: './select-membership.component.scss',
})
export class SelectMembershipComponent implements OnInit {
  memberships: Membership[] = [];
  selected = false;
  loading = true;
  timedOut = false;

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
    private itemsCacheService: ItemsCacheService
  ) {
    this.utilsService.sidebarLayout.next(false);
  }

  ngOnInit(): void {
    timer(this.itemsCacheService.timeoutDuration).subscribe(() => {
      if (this.loading) {
        this.timedOut = true;
        this.loading = false;
      }
    });
    this.getMemberships();
  }

  getMemberships(): void {
    this.authService.getMemberships().subscribe((memberships: Membership[]) => {
      this.memberships = memberships;
      this.loading = false;
    });
  }

  selectMembership(membership: any): void {
    if (!this.selected) {
      this.selected = true;
      const membershipObj = document.getElementById(membership.membershipId);
      membershipObj!.innerHTML = `<div class="spinner-border m-5" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;
      this.authService
        .selectMembership(membership)
        .pipe(
          timeout(this.utilsService.timeoutDuration),
          catchError(() => of('')),
          finalize(() => (this.selected = false))
        )
        .subscribe((redirect_url: string) => {
          window.location.href = redirect_url;
        });
    }
  }

  getPlatformName(type: any): string {
    return getPlatformName(type);
  }

  createIconLink(iconUri: string): string {
    return this.utilsService.createIconLink(iconUri);
  }
}
