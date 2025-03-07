import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { RECAPTCHA_SETTINGS, RecaptchaModule } from 'ng-recaptcha-2';
import { routes } from './app.routes';
import { ApiService } from './services/api.service';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { environment } from '../environments/environment.prod';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideAnimations(),
    provideHttpClient(withFetch()),
    ApiService,
    importProvidersFrom(RecaptchaModule),
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: environment.recaptcha.siteKey,
    },
    importProvidersFrom(MatNativeDateModule),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
};
