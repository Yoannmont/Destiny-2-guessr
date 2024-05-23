import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../_services/loader.service';
import { finalize } from 'rxjs';

export const httpLoaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/getWeapons')) {
    const loaderService = inject(LoaderService);
    loaderService.show();
    return next(req).pipe(
      finalize(() => {
        loaderService.hide();
      })
    );
  }
  return next(req);
};
