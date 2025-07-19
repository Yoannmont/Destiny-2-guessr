import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../_services/utils.service';
import { LangService } from '../../_services/lang.service';

@Component({
  selector: 'app-auth-callback',
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss',
})
export class AuthCallbackComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService
  ) {
    this.utilsService.sidebarLayout.next(false);
  }

  ngOnInit(): void {
    this.catchToken();
  }

  goToHomeWithLocale() {
    const locale = document.documentElement.lang;
    window.location.href = `/${locale}/#/`;
  }

  catchToken() {
    const fragment = window.location.hash.split('#')[2];
    const params = new URLSearchParams(fragment);
    const token = params.get('access_token');

    if (token) {
      localStorage.setItem('access_token', token);

      this.authService.initializeSession();
      this.goToHomeWithLocale();
    }
  }
}
