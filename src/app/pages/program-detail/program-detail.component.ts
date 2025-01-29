import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { Program } from '../../models/programs.models';
import { CommonModule } from '@angular/common';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
  imports: [CommonModule],
})
export class ProgramDetailComponent implements OnInit {
  program$!: Observable<Program | undefined>;

  constructor(
    private route: ActivatedRoute,
    private programsService: ProgramsService
  ) {}

  ngOnInit() {
    this.program$ = this.route.paramMap.pipe(
      switchMap((paramMap) => {
        const id = Number(paramMap.get('id'));
        return this.programsService.getProgramById(id);
      })
    );
  }

  getBackgroundImage(program: Program | undefined): string {
    return program ? `url(${program.banner})` : '';
  }
}
