import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  uploadPageImage(
    pageId: string,
    imageFile: File,
    altText: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('altText', altText);

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const url = `${this.apiUrl}/images/${pageId}`;

    return this.http.put<any>(url, formData, { headers }).pipe(
      catchError((error) => {
        console.error("Erreur d'upload détaillée:", error);
        return throwError(() => new Error("Échec de l'upload"));
      })
    );
  }

  getPageImage(pageId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/images/${pageId}`).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Réponse du serveur invalide');
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération de l'image ${pageId}`,
          error
        );
        return throwError(() => new Error("Impossible de récupérer l'image."));
      })
    );
  }
}
