import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  provideLucideIcons,
} from '@lucide/angular';
import { ConditionsData } from '../../models/organisation.models';
import { ApiService } from '../../services/api.service';
import { HtmlSanitizerService } from '../../services/html-sanitizer.service';
import { SeoService } from '../../services/seo.service';
import { PdfFile } from '../../models/pdf.models';
import { DynamicIconComponent } from '../../components/dynamic-icon/dynamic-icon.component';

@Component({
  selector: 'app-organisation',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, DynamicIconComponent],
  providers: [provideLucideIcons(LucideGraduationCap)],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss',
})
export class OrganisationComponent implements OnInit {
  private apiService = inject(ApiService);
  private seoService = inject(SeoService);
  private sanitizerService = inject(HtmlSanitizerService);

  private pageId = 'organisation-documents';

  organisationData!: ConditionsData;

  sanitize(value: string | undefined): string {
    return this.sanitizerService.sanitize(value || '');
  }

  hasPdfs: boolean = false;
  pdfsData: PdfFile[] = [];
  filteredPdfs: PdfFile[] = [];

  ngOnInit(): void {
    this.loadPdfsData();

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

  trackByIndex(index: number, item: any): number {
    return index;
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
