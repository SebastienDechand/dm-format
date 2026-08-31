import { Component, inject, signal } from '@angular/core';
import {
  NavigationStart,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideHouse,
  LucideImages,
  LucideInfo,
  LucideLogOut,
  LucideMenu,
  LucideMessageCircle,
  LucideScrollText,
  LucideX,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, LucideDynamicIcon],
  providers: [
    provideLucideIcons(
      LucideGraduationCap,
      LucideHouse,
      LucideImages,
      LucideInfo,
      LucideLogOut,
      LucideMenu,
      LucideMessageCircle,
      LucideScrollText,
      LucideX
    ),
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly mobileNavOpen = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.mobileNavOpen.set(false);
      }
    });
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
