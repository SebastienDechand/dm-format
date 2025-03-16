import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-toggle',
  templateUrl: './admin-toggle.component.html',
  styleUrl: './admin-toggle.component.scss',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class AdminToggleComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;

  toggleAdminMode() {
    this.adminService.toggleAdminMode();
  }
}
