import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { TrainingTestimonialsComponent } from '../../components/training-testimonials/training-testimonials.component';
import { Program } from '../../models/programs.models';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';
import { PdfFile } from '../../models/pdf.models';
import {
  LucideDynamicIcon,
  LucideClock,
  LucideCheck,
  LucideUsers,
  LucideKey,
  LucideMessageCircle,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TrainingTestimonialsComponent,
    RichTextEditorComponent,
    LucideDynamicIcon,
  ],
  providers: [
    provideLucideIcons(
      LucideClock,
      LucideCheck,
      LucideUsers,
      LucideKey,
      LucideMessageCircle
    ),
  ],
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
})
export class ProgramDetailComponent implements OnInit, OnDestroy {
  private apiService: ApiService = inject(ApiService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private seoService: SeoService = inject(SeoService);

  program?: Program;

  // Set by the admin form to embed this component as a live preview of
  // unsaved edits, instead of routing/fetching its own data - `program`
  // is the same object reference the form mutates, so it just re-renders
  // on every change detection tick with no extra plumbing needed.
  readonly previewMode = input(false);
  readonly previewProgram = input<Program>();

  hasPdfs: boolean = false;
  pdfsData?: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.previewMode()) {
      this.program = this.previewProgram();
      if (this.program?._id) {
        this.loadPdfsData();
      }
      return;
    }

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

  private loadPdfsData() {
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

  private updateSeo(program: Program): void {
    const plainTitle = program.title.replace(/<[^>]*>/g, '');

    const seoTitle = plainTitle.includes('SST')
      ? `Formation ${plainTitle} | DM-Format`
      : `Formation ${plainTitle} | SST | DM-Format`;

    let seoDescription: string;
    if (program.description) {
      seoDescription = program.description.substring(0, 157) + '...';
    } else {
      seoDescription = `Formation certifiante ${plainTitle}. Programme adapté aux professionnels et entreprises. Formez-vous au secourisme et à la prévention des risques.`;
    }

    this.seoService.updateMetadata({
      title: seoTitle,
      description: seoDescription,
      image: program.banner?.src || '/assets/images/dominique.webp',
      url: `https://dm-format.fr/trainings/${program._id}`,
      keywords: `formation ${plainTitle}, certification SST, secourisme, sauveteur secouriste, entreprise, prévention risques`,
    });

    this.seoService.setSchemaMarkup([
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: plainTitle,
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
            name: plainTitle,
            item: `https://dm-format.fr/trainings/${program._id}`,
          },
        ],
      },
    ]);
  }

  trackByIndex(index: number, _item: unknown): number {
    return index;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
