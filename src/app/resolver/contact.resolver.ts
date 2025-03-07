// resolvers/contact.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { SeoService } from '../services/seo.service';
import { ContactData } from '../models/contact.models';

@Injectable({
  providedIn: 'root',
})
export class ContactResolver implements Resolve<ContactData> {
  constructor(
    private apiService: ApiService,
    private seoService: SeoService
  ) {}

  resolve(): Observable<ContactData> {
    return this.apiService.getContact().pipe(
      tap(() => {
        this.seoService.updateMetadata({
          title: 'Contact | DM-Format',
          description:
            'Contactez DM-Format pour vos besoins en formation SST et formateur SST. Demandez un devis ou des informations pour vos formations de secourisme en entreprise.',
          url: 'https://dm-format.fr/contact',
        });

        this.seoService.setSchemaMarkup({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'DM-Format',
          description: 'Centre de formation SST et Formateur SST',
          telephone: '+33612345678',
          email: 'dm-formatsst@gmail.com',
          url: 'https://dm-format.fr/contact',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '32 Avenue de Marnay la ville',
            addressLocality: 'Marnay',
            postalCode: '70150',
            addressCountry: 'FR',
          },
          openingHours: 'Mo-Fr 09:00-18:00',
        });
      })
    );
  }
}
