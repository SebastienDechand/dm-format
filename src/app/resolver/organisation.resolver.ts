import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { SeoService } from '../services/seo.service';
import { ConditionsData } from '../models/organisation.models';

@Injectable({
  providedIn: 'root',
})
export class OrganisationResolver implements Resolve<ConditionsData> {
  private apiService = inject(ApiService);
  private seoService = inject(SeoService);

  resolve(): Observable<ConditionsData> {
    return this.apiService.getOrganisation().pipe(
      tap(() => {
        this.seoService.updateMetadata({
          title: "Conditions d'Organisation  | DM-Format",
          description:
            "Modalités d'organisation des formations SST, conditions générales, informations pratiques et accessibilité pour les formations de secourisme en entreprise.",
          url: 'https://dm-format.fr/organisation',
        });
      })
    );
  }
}
