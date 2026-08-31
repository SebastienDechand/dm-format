import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AutoResizeDirective } from '../../../directives/auto-resize.directive';
import { EditableImageComponent } from '../../../components/editable-image/editable-image.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { PdfFile } from '../../../models/pdf.models';
import { RichTextEditorComponent } from '../../../components/rich-text-editor/rich-text-editor.component';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideTrash2,
  LucideUpload,
  provideLucideIcons,
} from '@lucide/angular';

const CERTIFICATION_PDF_PAGE_ID = 'certification-documents';

@Component({
  selector: 'app-admin-home-form',
  standalone: true,
  imports: [
    FormsModule,
    AutoResizeDirective,
    EditableImageComponent,
    RichTextEditorComponent,
    LucideDynamicIcon,
  ],
  providers: [
    provideLucideIcons(LucidePlus, LucideTrash2, LucideUpload),
  ],
  templateUrl: './admin-home-form.component.html',
  styleUrl: './admin-home-form.component.scss',
})
export class AdminHomeFormComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  homeData: any;
  saving = false;

  pdfs: PdfFile[] = [];
  selectedPdfFile?: File;

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['homeData'];
    this.homeData = JSON.parse(JSON.stringify(resolved));
    this.loadPdfs();
  }

  onBannerImageUploaded(event: { url: string; altText: string }): void {
    this.homeData.banner.image = event.url;
  }

  addHighlight(): void {
    this.homeData.banner.highlights = [
      ...(this.homeData.banner.highlights ?? []),
      '',
    ];
  }

  removeHighlight(index: number): void {
    this.homeData.banner.highlights = this.homeData.banner.highlights.filter(
      (_: string, i: number) => i !== index
    );
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
      .uploadPagePdf(CERTIFICATION_PDF_PAGE_ID, formData)
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
    this.apiService.getPagePdfs(CERTIFICATION_PDF_PAGE_ID).subscribe({
      next: (res) => {
        this.pdfs = (res.data || []).filter(
          (pdf: PdfFile) => pdf.pageId === CERTIFICATION_PDF_PAGE_ID
        );
      },
      error: () => {
        this.pdfs = [];
      },
    });
  }

  save(): void {
    this.saving = true;
    this.apiService.patchHome(this.homeData).subscribe({
      next: (data) => {
        this.saving = false;
        this.homeData = data;
        this.toast.success('Page Accueil enregistrée avec succès !');
      },
      error: () => {
        this.saving = false;
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }
}
