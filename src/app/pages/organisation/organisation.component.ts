import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
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
import { PdfFile } from '../../models/pdf.models';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AutoResizeDirective } from '../../directives/auto-resize.directive';

@Component({
  selector: 'app-organisation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditButtonComponent,
    SafeHtmlPipe,
    EditableImageComponent,
    AutoResizeDirective,
  ],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss',
})
export class OrganisationComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private adminService = inject(AdminService);
  private editModeService = inject(EditModeService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  private pageId = 'organisation-documents';
  private destroy$ = new Subject<void>();

  organisationData!: ConditionsData;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  hasPdfs: boolean = false;
  pdfsData: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];
  selectedPdfFile?: File;

  imageRefreshTrigger = {
    header: true,
    intro: true,
    certification: true,
    financing: true,
  };

  ngOnInit(): void {
    this.loadPdfsData();

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

  onPdfFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPdfFile = input.files[0];
    }
  }

  uploadSelectedPdf() {
    if (!this.selectedPdfFile) return;

    const formData = new FormData();
    formData.append('pdf', this.selectedPdfFile);
    formData.append('title', this.selectedPdfFile.name);

    this.apiService.uploadPagePdf(this.pageId, formData).subscribe({
      next: () => {
        this.toast.success('PDF uploadé avec succès !');
        this.loadPdfsData();
      },
      error: (err) => {
        console.error('Erreur upload PDF :', err);
        this.toast.error(`Erreur : ${err.message}`);
      },
    });
  }

  loadPdfsData() {
    this.apiService.getPagePdfs(this.pageId).subscribe({
      next: (res) => {
        this.pdfsData = res.data || [];
        this.filteredPdfs = this.pdfsData.filter(
          (pdf) => pdf.pageId === this.pageId
        );
        this.hasPdfs = this.filteredPdfs.length > 0;
      },
      error: (err) => {
        console.error('Erreur chargement PDFs', err);
        this.hasPdfs = false;
      },
    });
  }

  deletePdf(pdf: PdfFile) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Êtes-vous sûr de vouloir supprimer le PDF "${pdf.title}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.apiService.deletePagePdf(pdf.pageId, pdf.publicId).subscribe({
        next: () => {
          this.toast.success('PDF supprimé avec succès !');
          this.loadPdfsData();
        },
        error: (err) => {
          console.error('Erreur suppression PDF :', err);
          this.toast.error('Erreur lors de la suppression du PDF.');
        },
      });
    });
  }

  saveChanges(callback?: () => void) {
    this.apiService.patchOrganisation(this.organisationData).subscribe(
      (data) => {
        this.organisationData = data;
        this.editModeService.resetEditModes();
        this.updateSeo(data);

        if (!callback) {
          this.toast.success('Modifications enregistrées avec succès !');
        }

        if (callback) {
          callback();
        }
      },
      (error) => {
        console.error('Error saving organisation page data', error);
        this.toast.error("Erreur lors de l'enregistrement.");
      }
    );
  }

  toggleEditMode(field: string) {
    if (this.isAdmin$) {
      this.editModeService.toggleEditMode(field);
    }
  }

  trackByIndex(index: number, _item: unknown): number {
    return index;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSeo(data: ConditionsData): void {
    let description =
      "Découvrez nos modalités d'organisation, conditions générales et informations pratiques pour les formations SST et Formateurs SST.";

    const textContent = data.intro.description?.trim();
    if (textContent?.length) {
      description =
        textContent.length > 157
          ? textContent.substring(0, 157) + '...'
          : textContent;
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
}
