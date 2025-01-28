import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
  imports: []
})
export class ProgramDetailComponent implements OnInit {
  program: { title: string; description: string } | undefined;

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
}
