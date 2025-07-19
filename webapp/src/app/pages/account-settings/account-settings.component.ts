import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { CommonModule } from '@angular/common';
import { getPlatformName } from '../../_classes/platform';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private router: Router,
    private authService: AuthService
  ) {
    this.utilsService.sidebarLayout.next(false);
  }

  ngOnInit(): void {}

  get currentAccount() {
    return this.authService.currentAccount;
  }

  getPlatformName(membershipType: number | undefined): string {
    if (!membershipType) return '';
    return getPlatformName(membershipType);
  }

  disconnectAccount(): void {
    this.authService.disconnectAccount().subscribe(() => {
      this.authService.removeAccessToken();
      this.authService.removeAccount();
      this.router.navigate(['/']);
    });
  }
}
