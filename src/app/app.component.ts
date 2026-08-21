import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, DOCUMENT, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { AdminToggleComponent } from './components/admin-toggle/admin-toggle.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    AdminToggleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private router = inject(Router);
  private document = inject<Document>(DOCUMENT);
  private platformId = inject<Object>(PLATFORM_ID);

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event) =>
            isPlatformBrowser(this.platformId) && event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.document.defaultView?.scrollTo(0, 0);
      });
  }
}
