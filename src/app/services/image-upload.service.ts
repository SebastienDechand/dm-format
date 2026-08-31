import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  uploadPageImage(
    pageId: string,
    imageFile: File,
    altText: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const url = `${this.apiUrl}/images/${pageId}`;

    return this.http.put<any>(url, formData).pipe(
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
