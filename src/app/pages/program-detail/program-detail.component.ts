import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Program } from '../../models/programs.models';
import { CommonModule } from '@angular/common';
import { Observable, switchMap } from 'rxjs';
import { ApiService } from '../../services/api.service';

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
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.program$ = this.route.paramMap.pipe(
      switchMap((paramMap) => {
        const id = paramMap.get('id');
        return id ? this.apiService.getProgramById(id) : [];
      })
    );
  }

  getBackgroundImage(program: Program | undefined): string {
    return program ? `url(${program.banner})` : '';
  }
}
