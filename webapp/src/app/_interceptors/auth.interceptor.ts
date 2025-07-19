import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';
import { inject } from '@angular/core';

export const authRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const authReq = req.clone({ withCredentials: true });
  return next(authReq);
};

export const tokenAuthRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  if (
    accessToken &&
    !authService.isTokenExpired(accessToken) &&
    req.url.includes('auth/')
  ) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return next(authReq);
  }
  return next(req);
};
