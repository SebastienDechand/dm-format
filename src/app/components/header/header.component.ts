import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Program } from '../../models/programs.models';
import { ApiService } from '../../services/api.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);

  trainings: Program[] = [];
  isAdmin$ = this.adminService.isAdminMode$;

  ngOnInit() {
    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;
    });
  }

  toggleAdminMode() {
    this.adminService.toggleAdminMode();
  }

  getIconForTraining(training: Program): string {
    switch (training.title) {
      case 'Acteurs Sauveteur Secouriste du Travail (niveau 1)':
        return 'person';
      case 'Formateurs Sauveteur Secouriste du Travail (niveau 2)':
        return 'school';
      case 'Initiations aux premiers secours':
        return 'favorite';
      case 'Aide pédagogique et administrative':
        return 'help';
      case "Sensibilisation aux gestes d'urgences":
        return 'volunteer_activism ';
      case 'Utilisation du défibrillateur':
        return 'electric_bolt';
      default:
        return 'menu_book';
    }
  }
}
