// seo.service.ts
import { Injectable, PLATFORM_ID, DOCUMENT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private document = inject<Document>(DOCUMENT);
  private platformId = inject<Object>(PLATFORM_ID);

  updateMetadata({
    title = 'DM-Format',
    description = 'Centre de formation spécialisé en Sauveteur Secouriste du Travail (SST) et formation de formateurs SST. Formations certifiantes pour professionnels et entreprises.',
    image = 'https://dm-format.fr/assets/images/dominique.jpg',
    url = '',
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
      url = `https://dm-format.fr${currentUrl}`;
    }

    const absoluteImage = image.startsWith('http')
      ? image
      : `https://dm-format.fr${image}`;

    // Admin-editable content (e.g. training titles) can carry inline HTML
    // for color-coding; that must never leak into <title> or meta tags.
    title = this.stripHtml(title);
    description = this.stripHtml(description);
    keywords = this.stripHtml(keywords);

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: absoluteImage });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: absoluteImage });

    this.updateCanonical(url);
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, '');
  }

  private updateCanonical(url: string): void {
    let link: HTMLLinkElement = this.document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
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
}
