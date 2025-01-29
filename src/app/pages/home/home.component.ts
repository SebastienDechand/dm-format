import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BannerComponent } from '../../components/banner/banner.component';
import { CertificationComponent } from '../../components/certification/certification.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { ProgramsComponent } from '../../components/programs/programs.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    BannerComponent,
    CertificationComponent,
    ProgramsComponent,
    GalleryComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
