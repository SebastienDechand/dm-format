import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Program } from '../../models/programs.models';
import { ApiService } from '../../services/api.service';

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
  trainings: Program[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;
    });
  }

  getIconForTraining(training: Program): string {
    switch (training.title) {
      case 'Acteurs SST (niveau 1)':
        return 'person';
      case 'Formateurs SST (niveau 2)':
        return 'school';
      case 'Initiations aux premiers secours':
        return 'favorite';
      case 'Aide pédagogique et administrative':
        return 'help';
      default:
        return 'menu_book';
    }
  }
}
