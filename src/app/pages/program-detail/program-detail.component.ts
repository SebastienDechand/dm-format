import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { Program } from '../../models/programs.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
  imports: [CommonModule],
})
export class ProgramDetailComponent implements OnInit {
  program: Program | undefined;

  constructor(
    private route: ActivatedRoute,
    private programsService: ProgramsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      const id = Number(paramMap.get('id'));
      this.program = this.programsService.getProgramById(id);
    });
  }

  getBackgroundImage(): string {
    return this.program ? `url(${this.program.banner})` : '';
  }
}
