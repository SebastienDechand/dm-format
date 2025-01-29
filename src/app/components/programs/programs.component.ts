import { Component } from '@angular/core';
import { Program } from '../../models/programs.models';
import { ProgramsService } from '../../services/programs.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-programs',
  imports: [RouterLink, CommonModule],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss',
  standalone: true,
})
export class ProgramsComponent {
  programs: Program[] = [];

  constructor(private programsService: ProgramsService) {
    this.programs = this.programsService.getPrograms();
  }
}
