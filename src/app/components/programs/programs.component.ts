import { Component, OnInit } from '@angular/core';
import { Program } from '../../models/programs.models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-programs',
  imports: [RouterLink, CommonModule],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss',
  standalone: true,
})
export class ProgramsComponent implements OnInit {
  trainings: Program[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;
    });
  }
}
