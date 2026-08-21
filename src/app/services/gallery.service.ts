import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { GalleryImage } from '../models/gallery.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private http = inject(HttpClient);

  readonly images = signal<GalleryImage[]>([]);
  readonly loading = signal<boolean>(false);

  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.upload_preset;
  private apiUrl = environment.apiUrl;

  constructor() {
    // console.log('GalleryService instancié');
    this.loadGallery();
  }

  public loadGallery(): void {
    this.loading.set(true);
    this.http
      .get<GalleryImage[]>(`${this.apiUrl}/gallery`)
      .pipe(
        catchError((error) => {
          console.error("Erreur lors du chargement depuis l'API:", error);
          return of([]);
        })
      )
      .subscribe((images) => {
        this.images.set(images);
        this.loading.set(false);
      });
  }

  uploadImage(file: File): Observable<GalleryImage> {
    // console.log('Démarrage upload image vers Cloudinary');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http
      .post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      )
      .pipe(
        // tap((response) => console.log('Réponse Cloudinary:', response)),
        switchMap((response: any) => {
          const newImage: GalleryImage = {
            title: 'Nouvelle image',
            description: "Ajoutée via l'interface",
            src: response.secure_url,
          };

          // console.log("Envoi de la nouvelle image à l'API:", newImage);
          return this.http.post<GalleryImage>(
            `${this.apiUrl}/gallery`,
            newImage
          );
        }),
        tap((createdImage) => {
          this.images.update((current) => [...current, createdImage]);
        }),
        catchError((error) => {
          console.error("Erreur lors de l'upload:", error);
          throw error;
        })
      );
  }

  deleteImage(imageId: string): void {
    // console.log("Suppression de l'image:", imageId);
    this.http.delete(`${this.apiUrl}/gallery/${imageId}`).subscribe(
      () => {
        this.images.update((current) =>
          current.filter((img) => img._id !== imageId)
        );
      },
      (error) => {
        console.error("Erreur lors de la suppression de l'image:", error);
      }
    );
  }

  updateImage(image: GalleryImage): Observable<GalleryImage> {
    if (!image._id) {
      console.error('Impossible de mettre à jour une image sans ID');
      return of(image);
    }

    return this.http
      .patch<GalleryImage>(`${this.apiUrl}/gallery/${image._id}`, {
        title: image.title,
        description: image.description,
        src: image.src,
      })
      .pipe(
        tap((updatedImage) => {
          this.images.update((current) => {
            const index = current.findIndex(
              (img) => img._id === updatedImage._id
            );
            if (index === -1) return current;
            const next = [...current];
            next[index] = updatedImage;
            return next;
          });
        }),
        catchError((error) => {
          console.error("Erreur lors de la mise à jour de l'image:", error);
          throw error;
        })
      );
  }
}
