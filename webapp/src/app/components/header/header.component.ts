import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LangService } from '../../_services/lang.service';
import { UtilsService } from '../../_services/utils.service';
import { AuthService } from '../../_services/auth.service';
import { getPlatformName } from '../../_classes/platform';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  constructor(
    public langService: LangService,
    public utilsService: UtilsService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.initializeSession();
  }

  login(): void {
    (
      document.querySelector(
        '[data-bs-target="#redirectionModal"]'
      ) as HTMLElement
    ).click();
    setTimeout(() => {
      this.authService.startBungieLogin();
    }, 3000);
  }

  logout(): void {
    this.authService
      .logout()
      .pipe(
        timeout(2000),
        finalize(() => {
          this.authService.removeAccessToken();
          this.authService.removeAccount();
          this.router.navigate(['/']);
        })
      )
      .subscribe(() => {
        console.log('>>> Successfully logged out');
      });
  }
}
