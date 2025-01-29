import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Program } from '../../models/programs.models';
import { ProgramsService } from '../../services/programs.service';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../components/banner/banner.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, BannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  programs: Program[] = [];

  constructor(private programsService: ProgramsService) {
    this.programs = this.programsService.getPrograms();
  }
}
