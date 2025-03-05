// seo.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateMetadata({
    title = 'DM-Format',
    description = 'Centre de formation spécialisé en Sauveteur Secouriste du Travail (SST) et formation de formateurs SST. Formations certifiantes pour professionnels et entreprises.',
    image = '/assets/images/massage1.webp',
    url = 'https://dm-format.fr/',
    keywords = 'formation SST, sauveteur secouriste du travail, formation formateur SST, secourisme entreprise, certification SST, prévention risques professionnels',
  }: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    keywords?: string;
  }) {
    if (!url) {
      const currentUrl = this.router.url;
      url = `${this.document.location.origin}${currentUrl}`;
    }

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  setSchemaMarkup(schema: any) {
    if (isPlatformBrowser(this.platformId)) {
      const existingScript = this.document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      this.document.head.appendChild(script);
    }
  }

  addSchemaMarkup(schema: any) {
    if (isPlatformBrowser(this.platformId)) {
      const existingScript = this.document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      this.document.head.appendChild(script);
    }
  }
}
