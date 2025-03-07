import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil, switchMap } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { Program } from '../../models/programs.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, EditButtonComponent],
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
})
export class ProgramDetailComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private seoService: SeoService = inject(SeoService);

  program?: Program;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

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
          }
        },
        (error) => {
          console.error('Error fetching program data', error);
        }
      );
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
      image: program.banner || '/assets/images/formation-sst.webp',
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

  saveChanges() {
    if (this.program) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.apiService.patchProgramById(id, this.program).subscribe(
          (data) => {
            this.program = data;
            this.editModeService.resetEditModes();

            this.updateSeo(data);

            alert('Changes saved successfully');
          },
          (error) => {
            console.error('Error saving program data', error);
          }
        );
      }
    }
  }

  getBackgroundImage(program: Program | undefined): string {
    return program ? `url(${program.banner})` : '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
