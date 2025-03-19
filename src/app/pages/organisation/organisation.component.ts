import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { ConditionsData } from '../../models/organisation.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { SeoService } from '../../services/seo.service';
import { EditableImageComponent } from '../../components/editable-image/editable-image.component';

@Component({
  selector: 'app-organisation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditButtonComponent,
    SafeHtmlPipe,
    EditableImageComponent,
  ],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss',
})
export class OrganisationComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);
  private seoService: SeoService = inject(SeoService);

  organisationData!: ConditionsData;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  imageRefreshTrigger = {
    header: true,
    intro: true,
    certification: true,
    financing: true,
  };

  onHeaderImageUploaded(imageData: { url: string; altText: string }): void {
    if (!this.organisationData.header.image) {
      this.organisationData.header.image = { src: '', alt: '' };
    }
    this.organisationData.header.image.src = imageData.url;
    if (imageData.altText) {
      this.organisationData.header.image.alt = imageData.altText;
    }

    this.saveChanges(() => {
      this.imageRefreshTrigger.header = false;
      setTimeout(() => (this.imageRefreshTrigger.header = true), 50);
    });
  }

  ngOnInit(): void {
    this.editModeService.editMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((editMode) => {
        this.editMode = editMode;
      });

    this.apiService.getOrganisation().subscribe(
      (data) => {
        this.organisationData = data;

        this.updateSeo(data);
      },
      (error) => {
        console.error('Error fetching organisation page data', error);
      }
    );
  }

  private updateSeo(data: ConditionsData): void {
    let description =
      "Découvrez nos modalités d'organisation, conditions générales et informations pratiques pour les formations SST et Formateurs SST.";

    if (data.intro.description) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = data.intro.description;
      const textContent =
        tempElement.textContent || tempElement.innerText || '';

      if (textContent.length > 0) {
        description = textContent.substring(0, 157) + '...';
      }
    }

    this.seoService.updateMetadata({
      title: "Modalités d'organisation et conditions générales | DM-Format",
      description: description,
      url: 'https://dm-format.fr/organisation',
      keywords:
        "conditions générales, modalités d'organisation, formation SST, accessibilité formation, règlement intérieur, conditions de vente",
    });

    this.seoService.setSchemaMarkup([
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: "Modalités d'organisation et conditions générales",
        description: description,
        publisher: {
          '@type': 'Organization',
          name: 'DM-Format',
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
            name: 'Organisation et Conditions',
            item: 'https://dm-format.fr/organisation',
          },
        ],
      },
    ]);
  }

  toggleEditMode(field: string) {
    if (this.isAdmin$) {
      this.editModeService.toggleEditMode(field);
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  saveChanges(callback?: () => void) {
    this.apiService.patchOrganisation(this.organisationData).subscribe(
      (data) => {
        this.organisationData = data;
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
        console.error('Error saving organisation page data', error);
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
