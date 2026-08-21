// resolvers/about.resolver.ts
import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { SeoService } from '../services/seo.service';
import { About } from '../models/about.models';

@Injectable({
  providedIn: 'root',
})
export class AboutResolver implements Resolve<About> {
  private apiService = inject(ApiService);
  private seoService = inject(SeoService);

  resolve(): Observable<About> {
    return this.apiService.getAbout().pipe(
      tap(() => {
        this.seoService.updateMetadata({
          title: 'À propos | DM-Format',
          description:
            'Découvrez notre centre de formation SST, notre philosophie et notre approche pédagogique. Formateurs experts en secourisme et prévention des risques professionnels.',
          url: 'https://dm-format.fr/about',
        });
      })
    );
  }
}
