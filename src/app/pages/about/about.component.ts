import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { EditableImageComponent } from '../../components/editable-image/editable-image.component';
import { About } from '../../models/about.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditButtonComponent,
    EditableImageComponent,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);
  private seoService: SeoService = inject(SeoService);

  aboutData!: About;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  uploadingImages: { [key: string]: boolean } = {
    'header.image': false,
    'who_we_are.image': false,
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.editModeService.editMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((editMode) => {
        this.editMode = editMode;
      });

    this.apiService.getAbout().subscribe(
      (data) => {
        this.aboutData = data;

        if (!this.aboutData.header.image) {
          this.aboutData.header.image = {
            src: 'assets/images/default-header.jpg',
            alt: "Image d'en-tête À propos",
          };
        }

        if (!this.aboutData.who_we_are.image) {
          this.aboutData.who_we_are.image = {
            src: 'assets/images/dominique.jpg',
            alt: 'Image Qui sommes-nous',
          };
        }

        this.updateSeo(data);
      },
      (error) => {
        console.error('Error fetching about page data', error);
      }
    );
  }

  private updateSeo(data: About): void {
    let description =
      "Découvrez notre centre de formation DM-Format, spécialisé dans les formations SST (Sauveteur Secouriste du Travail) et formateurs SST. Notre équipe d'experts vous accompagne dans votre parcours de formation.";

    if (data.header.description && data.header.description.trim().length > 0) {
      description =
        data.header.description.length > 157
          ? data.header.description.substring(0, 157) + '...'
          : data.header.description;
    }

    this.seoService.updateMetadata({
      title: 'À propos | DM-Format',
      description: description,
      image: data.header.image?.src || '/assets/images/massage4.webp',
      url: 'https://dm-format.fr/about',
      keywords:
        'à propos, centre formation SST, formateurs SST, notre équipe, notre histoire, expérience secourisme, formateurs certifiés',
    });

    this.seoService.setSchemaMarkup([
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'À propos de DM-Format',
        description: description,
        publisher: {
          '@type': 'Organization',
          name: 'DM-Format',
          logo: 'https://dm-format.fr/assets/images/logo.webp',
          url: 'https://dm-format.fr',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: 'https://dm-format.fr',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'À propos',
            item: 'https://dm-format.fr/about',
          },
        ],
      },
    ]);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  toggleEditMode(field: string) {
    if (this.isAdmin$) {
      this.editModeService.toggleEditMode(field);
    }
  }

  imageRefreshTrigger = {
    header: true,
    whoWeAre: true,
  };

  onHeaderImageUploaded(imageData: { url: string; altText: string }): void {
    if (!this.aboutData.header.image) {
      this.aboutData.header.image = { src: '', alt: '' };
    }
    this.aboutData.header.image.src = imageData.url;
    if (imageData.altText) {
      this.aboutData.header.image.alt = imageData.altText;
    }

    this.saveChanges(() => {
      this.imageRefreshTrigger.header = false;
      setTimeout(() => (this.imageRefreshTrigger.header = true), 50);
    });
  }

  onWhoWeAreImageUploaded(imageData: { url: string; altText: string }): void {
    if (!this.aboutData.who_we_are.image) {
      this.aboutData.who_we_are.image = { src: '', alt: '' };
    }
    this.aboutData.who_we_are.image.src = imageData.url;
    if (imageData.altText) {
      this.aboutData.who_we_are.image.alt = imageData.altText;
    }

    this.saveChanges(() => {
      this.imageRefreshTrigger.whoWeAre = false;
      setTimeout(() => (this.imageRefreshTrigger.whoWeAre = true), 50);
    });
  }

  saveChanges(callback?: () => void) {
    this.apiService.patchAbout(this.aboutData).subscribe(
      (data) => {
        this.aboutData = data;
        this.editModeService.resetEditModes();
        this.updateSeo(data);

        if (!callback) {
          alert('Changes saved successfully');
        }

        if (callback) {
          callback();
        }
      },
      (error) => {
        console.error('Error saving about page data', error);
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
