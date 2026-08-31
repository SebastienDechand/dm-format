import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, DOCUMENT, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private router = inject(Router);
  private document = inject<Document>(DOCUMENT);
  private platformId = inject<Object>(PLATFORM_ID);

  // Route resolvers block navigation until their HTTP call completes, with
  // no feedback otherwise — the page just freezes then snaps. This bar
  // gives an immediate visual cue so that wait doesn't feel like a stall.
  readonly isNavigating = signal(false);

  // The admin area is its own shell (AdminLayoutComponent draws its own
  // nav/header) - the public site header/footer must not render underneath
  // it. Initialized from the current URL directly so SSR output already
  // omits them on the first request, not just after a client-side nav.
  readonly isAdminRoute = signal(this.router.url.startsWith('/admin'));

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating.set(true);
        return;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isNavigating.set(false);
        if (event instanceof NavigationEnd) {
          this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
          this.document.defaultView?.scrollTo(0, 0);
        }
      }
    });
  }
}
