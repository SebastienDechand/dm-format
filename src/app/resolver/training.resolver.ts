// resolvers/training.resolver.ts
import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { SeoService } from '../services/seo.service';
import { Program } from '../models/programs.models';

@Injectable({
  providedIn: 'root',
})
export class TrainingResolver implements Resolve<Program> {
  private apiService = inject(ApiService);
  private seoService = inject(SeoService);

  resolve(route: ActivatedRouteSnapshot): Observable<Program> {
    const id = route.paramMap.get('id') || '';

    return this.apiService.getProgramById(id).pipe(
      tap((program) => {
        if (program) {
          const seoTitle = program.title.includes('SST')
            ? `Formation ${program.title} | DM-Format`
            : `Formation ${program.title} | SST | DM-Format`;

          let seoDescription = '';
          if (program.description) {
            seoDescription = program.description.substring(0, 150) + '...';
          } else {
            seoDescription = `Formation certifiante ${program.title}. Programme adapté aux professionnels et entreprises. Formez-vous au secourisme et à la prévention des risques.`;
          }

          this.seoService.updateMetadata({
            title: seoTitle,
            description: seoDescription,
            image: program.banner.src || '/assets/images/formation-sst.webp',
            url: `https://dm-format.fr/trainings/${program._id}`,
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
          });
        }
      })
    );
  }
}
