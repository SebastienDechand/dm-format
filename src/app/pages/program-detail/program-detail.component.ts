import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { TrainingTestimonialsComponent } from '../../components/training-testimonials/training-testimonials.component';
import { Program } from '../../models/programs.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';
import { SeoService } from '../../services/seo.service';
import { EditableImageComponent } from '../../components/editable-image/editable-image.component';
import { PdfFile } from '../../models/pdf.models';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AutoResizeDirective } from '../../directives/auto-resize.directive';
import { LucideAngularModule, Clock, Check, Users, Save } from 'lucide-angular';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditButtonComponent,
    TrainingTestimonialsComponent,
    EditableImageComponent,
    SafeHtmlPipe,
    AutoResizeDirective,
    LucideAngularModule,
  ],
  providers: [LucideAngularModule.pick({ Clock, Check, Users, Save }).providers ?? []],
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
})
export class ProgramDetailComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private seoService: SeoService = inject(SeoService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  program?: Program;

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  hasPdfs: boolean = false;
  pdfsData?: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];
  selectedPdfFile?: File;

  private destroy$ = new Subject<void>();

  imageRefreshTrigger: boolean = true;
  showBannerUpload: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.editModeService.editMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((editMode) => {
        this.editMode = editMode;
      });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          return id ? this.apiService.getProgramById(id) : [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (data) => {
          this.program = data;

          if (this.program) {
            this.updateSeo(this.program);
            this.loadPdfsData();
          }
        },
        (error) => {
          console.error('Error fetching program data', error);
        }
      );
  }

  filterPdfsByPageId(pageId: string): void {
    if (!this.pdfsData || !Array.isArray(this.pdfsData)) {
      this.filteredPdfs = [];
      return;
    }

    this.filteredPdfs = this.pdfsData.filter((pdf) => pdf.pageId === pageId);
  }

  onBannerImageUploaded(imageData: { url: string; altText: string }): void {
    if (this.program) {
      this.program.banner = { src: imageData.url, alt: imageData.altText };

      this.saveChanges(() => {
        this.imageRefreshTrigger = false;
        setTimeout(() => {
          this.imageRefreshTrigger = true;
          this.cdr.detectChanges();
        }, 50);
      });
    }
  }

  onPdfFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPdfFile = input.files[0];
    }
  }

  uploadSelectedPdf() {
    if (!this.selectedPdfFile || !this.program?._id) return;

    const pageId = `program-${this.getIdAsString(this.program._id)}`;
    const formData = new FormData();
    formData.append('pdf', this.selectedPdfFile);
    formData.append('title', this.selectedPdfFile.name);

    this.apiService.uploadPagePdf(pageId, formData).subscribe({
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
    if (!this.program?._id) return;

    const pageId = `program-${this.getIdAsString(this.program._id)}`;

    this.apiService.getPagePdfs(pageId).subscribe({
      next: (res) => {
        this.pdfsData = res.data || [];

        this.filteredPdfs = (this.pdfsData ?? []).filter(
          (pdf) => pdf.pageId === pageId
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
      if (confirmed) {
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
      }
    });
  }

  private updateSeo(program: Program): void {
    const seoTitle = program.title.includes('SST')
      ? `Formation ${program.title} | DM-Format`
      : `Formation ${program.title} | SST | DM-Format`;

    let seoDescription = '';
    if (program.description) {
      seoDescription = program.description.substring(0, 157) + '...';
    } else {
      seoDescription = `Formation certifiante ${program.title}. Programme adapté aux professionnels et entreprises. Formez-vous au secourisme et à la prévention des risques.`;
    }

    this.seoService.updateMetadata({
      title: seoTitle,
      description: seoDescription,
      image: program.banner?.src || '/assets/images/formation-sst.webp',
      url: `https://dm-format.fr/trainings/${program._id}`,
      keywords: `formation ${program.title}, certification SST, secourisme, sauveteur secouriste, entreprise, prévention risques`,
    });

    this.seoService.setSchemaMarkup({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: program.title,
      description: program.description,
      provider: {
        '@type': 'Organization',
        name: 'DM-Format',
        sameAs: 'https://dm-format.fr',
      },
      offers: {
        '@type': 'Offer',
        category: 'Formation professionnelle',
        availability: 'https://schema.org/InStock',
      },
    });

    this.seoService.addSchemaMarkup({
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
          name: 'Formations',
          item: 'https://dm-format.fr/trainings',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: program.title,
          item: `https://dm-format.fr/trainings/${program._id}`,
        },
      ],
    });
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  toggleEditMode(field: string) {
    this.editModeService.toggleEditMode(field);
  }

  saveChanges(callback?: () => void) {
    if (this.program) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.apiService.patchProgramById(id, this.program).subscribe(
          (data) => {
            this.program = data;
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
            console.error('Error saving program data', error);
            this.toast.error("Erreur lors de l'enregistrement.");
          }
        );
      }
    }
  }

  getIdAsString(id: any): string {
    if (!id) {
      return '';
    }

    if (typeof id === 'string') {
      return id;
    }

    if (id.$oid) {
      return id.$oid;
    }

    return String(id);
  }

  /* MODULES */
  addModule() {
    if (!this.program) return;

    this.program.modules.push({ title: '', description: '' });
    this.saveChanges();
  }

  deleteModule(index: number) {
    if (!this.program) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûr de vouloir supprimer ce module ?' },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.program!.modules.splice(index, 1);
        this.saveChanges();
      }
    });
  }

  /* DETAILS */
  addDetail() {
    if (!this.program) return;
    this.program.details.push('');
    this.saveChanges();
  }

  deleteDetail(index: number) {
    if (!this.program) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûr de vouloir supprimer cette ligne ?' },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.program!.details.splice(index, 1);
        this.saveChanges();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
