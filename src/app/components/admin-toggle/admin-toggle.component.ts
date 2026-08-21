import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import {
  LucideDynamicIcon,
  LucideUser,
  LucideShieldUser,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-toggle',
  templateUrl: './admin-toggle.component.html',
  styleUrl: './admin-toggle.component.scss',
  standalone: true,
  imports: [CommonModule, MatButtonModule, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideUser, LucideShieldUser)],
})
export class AdminToggleComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  readonly isAdmin = this.adminService.isAdmin;
  readonly isLoggedIn = this.authService.isLoggedIn;

  toggleAdminMode() {
    this.adminService.toggleAdminMode();
  }
}
