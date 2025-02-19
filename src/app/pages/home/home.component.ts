import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../components/banner/banner.component';
import { CertificationComponent } from '../../components/certification/certification.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { ProgramsComponent } from '../../components/programs/programs.component';
import { PartnerComponent } from '../../components/partner/partner.component';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

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
  private adminService: AdminService = inject(AdminService);

  homeData: any;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  constructor(private apiService: ApiService) {}

  toggleEditMode(section: string) {
    this.editMode[section] = !this.editMode[section];
  }

  saveChanges() {
    this.apiService.patchHome(this.homeData).subscribe(
      (data) => {
        this.homeData = data;
        alert('Changes saved successfully');
      },
      (error) => {
        console.error('Error saving home page data', error);
      }
    );
  }

  ngOnInit() {
    this.apiService.getHome().subscribe((data) => {
      this.homeData = data;
    });
  }
}
