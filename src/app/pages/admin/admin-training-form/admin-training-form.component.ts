import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { Program } from '../../../models/programs.models';
import { PdfFile } from '../../../models/pdf.models';
import { RichTextEditorComponent } from '../../../components/rich-text-editor/rich-text-editor.component';
import { EditableImageComponent } from '../../../components/editable-image/editable-image.component';
import { AutoResizeDirective } from '../../../directives/auto-resize.directive';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideTrash2,
  LucideUpload,
  provideLucideIcons,
} from '@lucide/angular';

function emptyProgram(): Program {
  return {
    _id: '',
    title: '',
    description: '',
    duration: '',
    audience: '',
    prerequisite: '',
    banner: { src: 'default-banner.jpg', alt: '' },
    summary: '',
    content: '',
    details: [],
    methodology: [],
    modules: [],
    images: [],
    pdf: [],
    information: '',
  };
}

@Component({
  selector: 'app-admin-training-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RichTextEditorComponent,
    EditableImageComponent,
    AutoResizeDirective,
    LucideDynamicIcon,
  ],
  providers: [provideLucideIcons(LucidePlus, LucideTrash2, LucideUpload)],
  templateUrl: './admin-training-form.component.html',
  styleUrl: './admin-training-form.component.scss',
})
export class AdminTrainingFormComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  readonly isCreateMode = signal(true);
  readonly saving = signal(false);
  readonly trainingId = signal<string | null>(null);

  program: Program = emptyProgram();

  readonly pdfs = signal<PdfFile[]>([]);
  selectedPdfFile?: File;

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['program'] as
      | Program
      | undefined;

    if (resolved) {
      this.isCreateMode.set(false);
      this.trainingId.set(resolved._id);
      this.program = { ...resolved };
      this.loadPdfs(resolved._id);
    }
  }

  get pageId(): string {
    return this.trainingId() ? `program-${this.trainingId()}` : '';
  }

  addModule(): void {
    this.program.modules = [
      ...this.program.modules,
      { title: '', description: '' },
    ];
  }

  removeModule(index: number): void {
    this.program.modules = this.program.modules.filter((_, i) => i !== index);
  }

  addDetail(): void {
    this.program.details = [...this.program.details, ''];
  }

  removeDetail(index: number): void {
    this.program.details = this.program.details.filter((_, i) => i !== index);
  }

  addMethodology(): void {
    this.program.methodology = [...this.program.methodology, ''];
  }

  removeMethodology(index: number): void {
    this.program.methodology = this.program.methodology.filter(
      (_, i) => i !== index
    );
  }

  onBannerUploaded(event: { url: string; altText: string }): void {
    this.program.banner = { src: event.url, alt: event.altText };
  }

  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPdfFile = input.files[0];
    }
  }

  uploadSelectedPdf(): void {
    if (!this.selectedPdfFile || !this.pageId) return;

    const formData = new FormData();
    formData.append('pdf', this.selectedPdfFile);
    formData.append('title', this.selectedPdfFile.name);

    this.apiService.uploadPagePdf(this.pageId, formData).subscribe({
      next: () => {
        this.toast.success('PDF ajouté avec succès !');
        this.selectedPdfFile = undefined;
        this.loadPdfs(this.trainingId()!);
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
          this.loadPdfs(this.trainingId()!);
        },
        error: () => {
          this.toast.error('Erreur lors de la suppression du PDF.');
        },
      });
    });
  }

  // A blank `_id: ''` would otherwise reach Mongoose, which fails casting
  // it to an ObjectId - the create request must omit the field entirely.
  private withoutId(program: Program): Partial<Program> {
    const { _id, ...rest } = program;
    return rest;
  }

  private loadPdfs(id: string): void {
    this.apiService.getPagePdfs(`program-${id}`).subscribe({
      next: (res) => {
        this.pdfs.set(
          (res.data || []).filter(
            (pdf: PdfFile) => pdf.pageId === `program-${id}`
          )
        );
      },
      error: () => {
        this.pdfs.set([]);
      },
    });
  }

  save(): void {
    this.saving.set(true);
    const id = this.trainingId();

    const request = id
      ? this.apiService.patchProgramById(id, this.program)
      : this.apiService.createProgram(this.withoutId(this.program));

    request.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.toast.success('Formation enregistrée avec succès !');
        if (!id) {
          // Redirect into edit mode so the banner/PDF (which need a real
          // training id) become available right away, instead of bouncing
          // back to the list.
          this.router.navigate(['/admin/trainings', result._id]);
        }
      },
      error: () => {
        this.saving.set(false);
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }
}
