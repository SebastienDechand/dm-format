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
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { ApiService } from './services/api.service';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideAnimations(),
    provideHttpClient(withFetch()),
    ApiService,
    importProvidersFrom(MatNativeDateModule),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
};
