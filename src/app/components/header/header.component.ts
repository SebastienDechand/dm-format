import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  HostListener,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Program } from '../../models/programs.models';
import { ApiService } from '../../services/api.service';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    RouterLinkActive,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  trainings: Program[] = [];
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  showLoginButton: boolean = false;
  isMobileView: boolean = false;
  isSmallScreen: boolean = false;
  isSidenavOpen: boolean = false;
  isAuthPopupOpen: boolean = false;
  isBrowser: boolean = false;

  private clickCount = 0;
  private clickTimer: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Observateur pour les breakpoints
    if (this.isBrowser) {
      this.breakpointObserver
        .observe(['(max-width: 1400px)', '(max-width: 768px)'])
        .subscribe((result) => {
          this.isMobileView = result.breakpoints['(max-width: 1400px)'];
          this.isSmallScreen = result.breakpoints['(max-width: 768px)'];
        });
    }

    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;
    });
  }

  toggleAuthPopup() {
    // Cette méthode n'est plus utilisée car nous utilisons un header étendu
    // au lieu d'une popup
  }

  closeAuthPopup() {
    // Cette méthode n'est plus utilisée
  }

  logoutAndClosePopup() {
    // Nous utilisons simplement logout() maintenant
    this.logout();
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav() {
    this.isSidenavOpen = false;
  }

  stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  handleLogoClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.clickCount++;

    clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => {
      // Si triple clic détecté
      if (this.clickCount === 3) {
        this.showAdminLogin();
      }

      // Si moins de 3 clics et qu'on veut naviguer vers l'accueil
      else if (this.clickCount === 1) {
        this.router.navigate(['/']);
      }

      // Réinitialiser le compteur
      this.clickCount = 0;
    }, 500);
  }

  showAdminLogin() {
    this.showLoginButton = true;
    setTimeout(() => {
      this.showLoginButton = false;
    }, 10000);
  }

  toggleAdminMode() {
    this.adminService.toggleAdminMode();
  }

  logout() {
    this.authService.logout();
    this.adminService.setAdminMode(false);
    this.closeSidenav();
  }

  getIconForTraining(training: Program): string {
    switch (training.title) {
      case 'Acteur Sauveteur Secouriste du Travail (niveau 1)':
        return 'person';
      case 'Formateur Sauveteur Secouriste du Travail (niveau 2)':
        return 'school';
      case 'Aide pédagogique et administrative':
        return 'help';
      case "Sensibilisation aux gestes d'urgence":
        return 'volunteer_activism';
      case 'Utilisation du défibrillateur':
        return 'electric_bolt';
      default:
        return 'menu_book';
    }
  }
}
