import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BannerComponent } from '../../components/banner/banner.component';
import { CertificationComponent } from '../../components/certification/certification.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { ProgramsComponent } from '../../components/programs/programs.component';
import { PartnerComponent } from '../../components/partner/partner.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    BannerComponent,
    CertificationComponent,
    ProgramsComponent,
    PartnerComponent,
    GalleryComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  homeData: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getHome().subscribe((data) => {
      this.homeData = data;
    });
  }
}
