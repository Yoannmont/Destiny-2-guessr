import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpLoaderInterceptor } from './_interceptors/http-loader.interceptor';
import {
  authRequestInterceptor,
  tokenAuthRequestInterceptor,
} from './_interceptors/auth.interceptor';
import { IMAGE_CONFIG } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        httpLoaderInterceptor,
        tokenAuthRequestInterceptor,
        authRequestInterceptor,
      ])
    ),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
