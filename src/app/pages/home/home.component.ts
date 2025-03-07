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
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
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
  private seoService: SeoService = inject(SeoService);
  private apiService: ApiService = inject(ApiService);

  homeData: any;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  toggleEditMode(section: string) {
    this.editMode[section] = !this.editMode[section];
  }

  saveChanges() {
    this.apiService.patchHome(this.homeData).subscribe(
      (data) => {
        this.homeData = data;
        this.updateSeo(data);
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
      this.updateSeo(data);
    });
  }

  private updateSeo(data: any): void {
    const title = 'DM-Format | Formation SST';

    let description =
      'Centre de formation spécialisé en Sauveteur Secouriste du Travail (SST) et formation de formateurs SST. Formations certifiantes pour professionnels et entreprises.';

    let image = 'https://dm-format.fr/assets/images/massage1.webp';
    if (data?.banner?.image) {
      image = data.banner.image;
    }

    let keywords =
      'formation SST, sauveteur secouriste du travail, formation formateur SST, secourisme entreprise, certification SST, prévention risques professionnels';

    this.seoService.updateMetadata({
      title,
      description,
      image,
      url: 'https://dm-format.fr/',
      keywords,
    });

    this.seoService.setSchemaMarkup([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'DM-Format',
        url: 'https://dm-format.fr',
        logo: 'https://dm-format.fr/assets/images/logo.webp',
        description: description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'DM-Format',
        url: 'https://dm-format.fr',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://dm-format.fr/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'DM-Format',
        image: image,
        telephone: '+33681191790',
        email: 'dm-format@gmail.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Marnay',
          postalCode: '70150',
          streetAddress: '32 avenue de Marnay la Ville',
          addressCountry: 'FR',
        },
        priceRange: '€€',
        description: description,
      },
    ]);
  }
}
