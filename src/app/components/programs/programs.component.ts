import { Component, OnInit } from '@angular/core';
import { Program } from '../../models/programs.models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-programs',
  imports: [
    RouterLink,
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss',
  standalone: true,
})
export class ProgramsComponent implements OnInit {
  trainings: Program[] = [];
  certifyingTrainings: Program[] = [];
  nonCertifyingTrainings: Program[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;

      this.certifyingTrainings = data.slice(0, 3);
      this.nonCertifyingTrainings = data.slice(3, 6);
    });
  }
}
