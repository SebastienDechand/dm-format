import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { HtmlSanitizerService } from '../../services/html-sanitizer.service';
import { PdfFile } from '../../models/pdf.models';

@Component({
  selector: 'app-certification',
  imports: [CommonModule],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss',
  standalone: true,
})
export class CertificationComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private sanitizerService = inject(HtmlSanitizerService);

  @Input() certificationData: any;

  get safeTitle(): string {
    return this.sanitizerService.sanitize(this.certificationData?.title || '');
  }

  pdfsData: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];
  hasPdfs = false;
  private pageId = 'certification-documents';

  ngOnInit(): void {
    this.loadPdfsData();
  }

  private loadPdfsData() {
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
}
