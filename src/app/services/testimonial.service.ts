import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { Testimonial } from '../models/testimonials.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/testimonials`;

  getTestimonialsByTraining(trainingId: string): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      map((response: any) => {
        if (response && response.data) {
          const filteredData = response.data.filter(
            (testimonial: any) =>
              testimonial.trainingId === trainingId ||
              (testimonial.trainingId &&
                testimonial.trainingId.$oid === trainingId)
          );

          return {
            success: true,
            count: filteredData.length,
            data: filteredData,
          };
        }
        return response;
      }),
      catchError((error) => {
        console.error('Erreur API lors du chargement des témoignages:', error);
        return of({ success: true, count: 0, data: [] });
      })
    );
  }

  addTestimonial(testimonial: Testimonial): Observable<any> {
    return this.http.post(this.apiUrl, testimonial);
  }

  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAllForAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`);
  }

  setApproved(id: string, approved: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { approved });
  }
}
