import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AutoResizeDirective } from '../../../directives/auto-resize.directive';
import { EditableImageComponent } from '../../../components/editable-image/editable-image.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { ConditionsData } from '../../../models/organisation.models';
import { PdfFile } from '../../../models/pdf.models';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideTrash2,
  LucideUpload,
  provideLucideIcons,
} from '@lucide/angular';

const ORGANISATION_PDF_PAGE_ID = 'organisation-documents';

@Component({
  selector: 'app-admin-organisation-form',
  standalone: true,
  imports: [
    FormsModule,
    AutoResizeDirective,
    EditableImageComponent,
    LucideDynamicIcon,
  ],
  providers: [
    provideLucideIcons(LucidePlus, LucideTrash2, LucideUpload),
  ],
  templateUrl: './admin-organisation-form.component.html',
  styleUrl: './admin-organisation-form.component.scss',
})
export class AdminOrganisationFormComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  data!: ConditionsData;
  saving = false;

  pdfs: PdfFile[] = [];
  selectedPdfFile?: File;

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['organisationData'] as ConditionsData;
    this.data = JSON.parse(JSON.stringify(resolved));
    this.loadPdfs();
  }

  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPdfFile = input.files[0];
    }
  }

  uploadSelectedPdf(): void {
    if (!this.selectedPdfFile) return;

    const formData = new FormData();
    formData.append('pdf', this.selectedPdfFile);
    formData.append('title', this.selectedPdfFile.name);

    this.apiService
      .uploadPagePdf(ORGANISATION_PDF_PAGE_ID, formData)
      .subscribe({
        next: () => {
          this.toast.success('PDF ajouté avec succès !');
          this.selectedPdfFile = undefined;
          this.loadPdfs();
        },
        error: () => {
          this.toast.error("Erreur lors de l'ajout du PDF.");
        },
      });
  }

  deletePdf(pdf: PdfFile): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Supprimer le PDF "${pdf.title}" ?` },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.apiService.deletePagePdf(pdf.pageId, pdf.publicId).subscribe({
        next: () => {
          this.toast.success('PDF supprimé.');
          this.loadPdfs();
        },
        error: () => {
          this.toast.error('Erreur lors de la suppression du PDF.');
        },
      });
    });
  }

  private loadPdfs(): void {
    this.apiService.getPagePdfs(ORGANISATION_PDF_PAGE_ID).subscribe({
      next: (res) => {
        this.pdfs = (res.data || []).filter(
          (pdf: PdfFile) => pdf.pageId === ORGANISATION_PDF_PAGE_ID
        );
      },
      error: () => {
        this.pdfs = [];
      },
    });
  }

  onHeaderImageUploaded(event: { url: string; altText: string }): void {
    this.data.header.image = { src: event.url, alt: event.altText };
  }

  addGeneralConditionPoint(): void {
    this.data.general_conditions.points = [
      ...this.data.general_conditions.points,
      { icon: '', title: '', description: '' },
    ];
  }

  removeGeneralConditionPoint(index: number): void {
    this.data.general_conditions.points =
      this.data.general_conditions.points.filter((_, i) => i !== index);
  }

  addCertificationDetail(): void {
    this.data.certification.details = [
      ...this.data.certification.details,
      '',
    ];
  }

  removeCertificationDetail(index: number): void {
    this.data.certification.details = this.data.certification.details.filter(
      (_, i) => i !== index
    );
  }

  addObligationPoint(): void {
    this.data.obligations.points = [
      ...this.data.obligations.points,
      { icon: '', title: '', description: '' },
    ];
  }

  removeObligationPoint(index: number): void {
    this.data.obligations.points = this.data.obligations.points.filter(
      (_, i) => i !== index
    );
  }

  addFinancingStep(): void {
    this.data.financing.steps = [
      ...this.data.financing.steps,
      { icon: '', text: '' },
    ];
  }

  removeFinancingStep(index: number): void {
    this.data.financing.steps = this.data.financing.steps.filter(
      (_, i) => i !== index
    );
  }

  save(): void {
    this.saving = true;
    this.apiService.patchOrganisation(this.data).subscribe({
      next: (data) => {
        this.saving = false;
        this.data = data;
        this.toast.success('Page Organisation enregistrée avec succès !');
      },
      error: () => {
        this.saving = false;
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }
}
