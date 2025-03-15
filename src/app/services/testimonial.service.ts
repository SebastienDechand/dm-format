import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Testimonial, TestimonialResponse } from '../models/testimonials.model';

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  private apiUrl = `${environment.apiUrl}/api/testimonials`;

  constructor(private http: HttpClient) {}

  // Ajouter un nouveau témoignage
  addTestimonial(testimonial: Testimonial): Observable<TestimonialResponse> {
    return this.http.post<TestimonialResponse>(this.apiUrl, testimonial);
  }

  // Récupérer tous les témoignages
  getAllTestimonials(): Observable<TestimonialResponse> {
    return this.http.get<TestimonialResponse>(this.apiUrl);
  }

  // Récupérer les témoignages pour une formation spécifique
  getTestimonialsByTraining(
    trainingId: string
  ): Observable<TestimonialResponse> {
    return this.http.get<TestimonialResponse>(
      `${this.apiUrl}/training/${trainingId}`
    );
  }

  // Récupérer un témoignage par son ID
  getTestimonialById(id: string): Observable<TestimonialResponse> {
    return this.http.get<TestimonialResponse>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un témoignage
  updateTestimonial(
    id: string,
    testimonial: Partial<Testimonial>
  ): Observable<TestimonialResponse> {
    return this.http.patch<TestimonialResponse>(
      `${this.apiUrl}/${id}`,
      testimonial
    );
  }

  // Supprimer un témoignage
  deleteTestimonial(id: string): Observable<TestimonialResponse> {
    return this.http.delete<TestimonialResponse>(`${this.apiUrl}/${id}`);
  }
}
