// home.resolver.ts
import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { SeoService } from '../services/seo.service';

@Injectable({
  providedIn: 'root',
})
export class HomeResolver implements Resolve<any> {
  private apiService = inject(ApiService);
  private seoService = inject(SeoService);

  resolve(): Observable<any> {
    return this.apiService.getHome().pipe(
      tap(() => {
        this.seoService.updateMetadata({
          title: 'DM-Format',
          description:
            'DM-Format, votre centre spécialisé dans les formations SST (Sauveteur Secouriste du Travail) et formation de formateurs SST. Formations certifiantes pour entreprises et professionnels.',
          image: '/assets/images/dominique.webp',
        });

        this.seoService.setSchemaMarkup({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'DM-Format',
          url: 'https://dm-format.fr',
          logo: 'https://dm-format.fr/assets/images/logo.png',
          description:
            'Centre de formation spécialisé en Sauveteur Secouriste du Travail (SST) et formation de formateurs SST',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Marnay',
            postalCode: '70150',
            streetAddress: '32 avenue de Marnay la Ville',
            addressCountry: 'FR',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+33681191790',
            contactType: 'customer service',
            email: 'dm.formatsst@gmail.com',
          },
        });
      })
    );
  }
}
