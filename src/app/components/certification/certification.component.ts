import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  OnInit,
  output,
} from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { AdminService } from '../../services/admin.service';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PdfFile } from '../../models/pdf.models';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AutoResizeDirective } from '../../directives/auto-resize.directive';
import { LucideAngularModule, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-certification',
  imports: [
    CommonModule,
    SafeHtmlPipe,
    EditButtonComponent,
    FormsModule,
    AutoResizeDirective,
    LucideAngularModule,
  ],
  providers: [LucideAngularModule.pick({ Trash2 }).providers ?? []],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss',
  standalone: true,
})
export class CertificationComponent implements OnInit {
  private adminService: AdminService = inject(AdminService);
  private apiService: ApiService = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  @Input() certificationData: any;
  readonly editClicked = output<void>();

  readonly isAdmin = this.adminService.isAdmin;
  editMode: { [key: string]: boolean } = {};
  pdfsData: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];
  hasPdfs = false;
  pageId = 'certification-documents';
  selectedPdfFile?: File;

  private readonly resetCertLinkEditOnAdmin = effect(() => {
    if (this.isAdmin()) {
      this.editMode['certLink'] = false;
    }
  });

  ngOnInit(): void {
    this.loadPdfsData();
  }

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
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
        this.selectedPdfFile = undefined;
        this.loadPdfsData();
      },
      error: (err) => {
        console.error('Erreur upload PDF :', err);
        this.toast.error(`Erreur : ${err.message}`);
      },
    });
  }

  deletePdf(pdf: PdfFile) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Supprimer le PDF "${pdf.title}" ?` },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.apiService.deletePagePdf(pdf.pageId, pdf.publicId).subscribe({
          next: () => {
            this.toast.success('PDF supprimé !');
            this.loadPdfsData();
          },
          error: (err) => {
            console.error('Erreur suppression PDF :', err);
            this.toast.error('Erreur lors de la suppression.');
          },
        });
      }
    });
  }
}
