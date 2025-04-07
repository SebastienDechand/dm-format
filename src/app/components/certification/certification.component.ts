import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PdfFile } from '../../models/pdf.models';

@Component({
  selector: 'app-certification',
  imports: [CommonModule, SafeHtmlPipe, EditButtonComponent, FormsModule],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss',
  standalone: true,
})
export class CertificationComponent implements OnInit {
  private adminService: AdminService = inject(AdminService);
  private apiService: ApiService = inject(ApiService);

  @Input() certificationData: any;
  @Output() editClicked = new EventEmitter<void>();

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  pdfsData: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];
  hasPdfs = false;
  pageId = 'certification-documents';
  selectedPdfFile?: File;

  ngOnInit(): void {
    this.loadPdfsData();
    this.isAdmin$.subscribe((isAdmin) => {
      if (isAdmin) {
        this.editMode['certLink'] = false;
      }
    });
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
        alert('PDF uploadé avec succès !');
        this.selectedPdfFile = undefined;
        this.loadPdfsData();
      },
      error: (err) => {
        console.error('Erreur upload PDF :', err);
        alert(`Erreur : ${err.message}`);
      },
    });
  }

  deletePdf(pdf: PdfFile) {
    if (!confirm(`Supprimer le PDF "${pdf.title}" ?`)) return;

    this.apiService.deletePagePdf(pdf.pageId, pdf.publicId).subscribe({
      next: () => {
        alert('PDF supprimé !');
        this.loadPdfsData();
      },
      error: (err) => {
        console.error('Erreur suppression PDF :', err);
        alert('Erreur lors de la suppression.');
      },
    });
  }
}
