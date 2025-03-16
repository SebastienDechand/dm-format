import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
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

  /**
   * Upload une image pour une page spécifique
   */
  // src/app/services/image-upload.service.ts
  uploadPageImage(
    pageId: string,
    imageFile: File,
    altText: string
  ): Observable<any> {
    // Créer un FormData simple
    const formData = new FormData();
    formData.append('image', imageFile);

    // Log pour débogage
    console.log(
      `Tentative d'upload pour ${pageId}, taille: ${imageFile.size}, type: ${imageFile.type}`
    );

    // Obtenez votre token
    const token = this.authService.getToken();
    console.log('Token disponible:', !!token);

    // Headers avec Authorization
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // URL complète pour débogage
    const url = `${this.apiUrl}/images/${pageId}`;
    console.log("URL d'upload:", url);

    // Requête simplifiée
    return this.http.put<any>(url, formData, { headers }).pipe(
      tap((response) => console.log('Réponse serveur:', response)),
      catchError((error) => {
        console.error("Erreur d'upload détaillée:", error);
        return throwError(() => new Error("Échec de l'upload"));
      })
    );
  }

  /**
   * Récupère l'image d'une page spécifique
   */
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

  /**
   * Récupère le token d'authentification depuis le service d'auth
   */
  private getAuthToken(): string {
    return this.authService.getToken() || '';
  }
}
