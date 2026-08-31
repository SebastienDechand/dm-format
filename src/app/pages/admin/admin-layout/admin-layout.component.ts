import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideHouse,
  LucideImages,
  LucideInfo,
  LucideLogOut,
  LucideScrollText,
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
      LucideScrollText
    ),
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
