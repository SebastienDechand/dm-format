import { Component, OnInit } from '@angular/core';
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
export class ProgramsComponent implements OnInit {
  programs: Program[] = [];

  constructor(private programsService: ProgramsService) {}

  ngOnInit() {
    this.programsService.getPrograms().subscribe((data) => {
      this.programs = data;
    });
  }
}
