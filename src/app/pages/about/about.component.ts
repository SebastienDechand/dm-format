import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LucideDynamicIcon, LucideCheck, provideLucideIcons } from '@lucide/angular';
import { About } from '../../models/about.models';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';
import { DynamicIconComponent } from '../../components/dynamic-icon/dynamic-icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, DynamicIconComponent],
  providers: [provideLucideIcons(LucideCheck)],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private seoService: SeoService = inject(SeoService);

  aboutData!: About;

  ngOnInit(): void {
    this.apiService.getAbout().subscribe(
      (data) => {
        this.aboutData = data;

        if (!this.aboutData.header.image) {
          this.aboutData.header.image = {
            src: 'assets/images/default-header.jpg',
            alt: "Image d'en-tête À propos",
          };
        }

        if (!this.aboutData.who_we_are.image) {
          this.aboutData.who_we_are.image = {
            src: 'assets/images/dominique.webp',
            alt: 'Image Qui sommes-nous',
          };
        }

        this.updateSeo(data);
      },
      (error) => {
        console.error('Error fetching about page data', error);
      }
    );
  }

  private updateSeo(data: About): void {
    let description =
      "Découvrez notre centre de formation DM-Format, spécialisé dans les formations SST (Sauveteur Secouriste du Travail) et formateurs SST. Notre équipe d'experts vous accompagne dans votre parcours de formation.";

    if (data.header.description && data.header.description.trim().length > 0) {
      description =
        data.header.description.length > 157
          ? data.header.description.substring(0, 157) + '...'
          : data.header.description;
    }

    this.seoService.updateMetadata({
      title: 'À propos | DM-Format',
      description: description,
      image: data.header.image?.src || '/assets/images/dominique.webp',
      url: 'https://dm-format.fr/about',
      keywords:
        'à propos, centre formation SST, formateurs SST, notre équipe, notre histoire, expérience secourisme, formateurs certifiés',
    });

    this.seoService.setSchemaMarkup([
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'À propos de DM-Format',
        description: description,
        publisher: {
          '@type': 'Organization',
          name: 'DM-Format',
          logo: 'https://dm-format.fr/assets/images/logo.png',
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
            name: 'À propos',
            item: 'https://dm-format.fr/about',
          },
        ],
      },
    ]);
  }

  trackByIndex(index: number, _item: unknown): number {
    return index;
  }
}
