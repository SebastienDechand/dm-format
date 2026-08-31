import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideMenu,
  LucideX,
  LucideUser,
  LucideSchool,
  LucideCircleQuestionMark,
  LucideHeartHandshake,
  LucideZap,
  LucideBookOpen,
  LucideLogIn,
  LucideLogOut,
  LucideLayoutDashboard,
  provideLucideIcons,
} from '@lucide/angular';
import type { LucideIcon } from '@lucide/angular';
import { Program } from '../../models/programs.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    MatSidenavModule,
    RouterLinkActive,
    LucideDynamicIcon,
  ],
  providers: [
    provideLucideIcons(
      LucideMenu,
      LucideX,
      LucideUser,
      LucideSchool,
      LucideCircleQuestionMark,
      LucideHeartHandshake,
      LucideZap,
      LucideBookOpen,
      LucideLogIn,
      LucideLogOut,
      LucideLayoutDashboard
    ),
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent implements OnInit {
  private platformId = inject<Object>(PLATFORM_ID);
  private breakpointObserver = inject(BreakpointObserver);

  private apiService: ApiService = inject(ApiService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  trainings: Program[] = [];
  readonly isLoggedIn = this.authService.isLoggedIn;
  showLoginButton: boolean = false;
  isMobileView: boolean = false;
  isSidenavOpen: boolean = false;
  isBrowser: boolean = false;

  private clickCount = 0;
  private clickTimer: any = null;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.breakpointObserver
        .observe(['(max-width: 1400px)'])
        .subscribe((result) => {
          this.isMobileView = result.matches;
        });
    }

    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;
    });
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

  logout() {
    this.authService.logout();
    this.closeSidenav();
  }

  getIconForTraining(training: Program): LucideIcon {
    switch (this.stripHtmlTags(training.title)) {
      case 'Acteur Sauveteur Secouriste du Travail (niveau 1)':
        return LucideUser;
      case 'Formateur en Sauvetage et Secourisme au Travail (niveau 2)':
        return LucideSchool;
      case 'Aide pédagogique et administrative':
        return LucideCircleQuestionMark;
      case "Sensibilisation aux gestes d'urgence":
        return LucideHeartHandshake;
      case 'Utilisation du défibrillateur':
        return LucideZap;
      default:
        return LucideBookOpen;
    }
  }
}
