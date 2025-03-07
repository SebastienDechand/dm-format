import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { GalleryImage } from '../models/gallery.models';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private imagesSubject = new BehaviorSubject<GalleryImage[]>([]);
  images$ = this.imagesSubject.asObservable();

  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.upload_preset;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.loadGallery();
  }

  private loadGallery(): void {
    this.http
      .get<GalleryImage[]>(`${this.apiUrl}/gallery`)
      .pipe(
        catchError((error) => {
          console.error("Erreur lors du chargement depuis l'API:", error);
          return of([]);
        })
      )
      .subscribe((images) => {
        this.imagesSubject.next(images);
      });
  }

  uploadImage(file: File): Observable<GalleryImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http
      .post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      )
      .pipe(
        switchMap((response: any) => {
          const newImage: GalleryImage = {
            title: 'Nouvelle image',
            description: "Ajoutée via l'interface",
            src: response.secure_url,
          };

          return this.http.post<GalleryImage>(
            `${this.apiUrl}/gallery`,
            newImage
          );
        }),
        tap((createdImage) => {
          const currentImages = this.imagesSubject.getValue();
          this.imagesSubject.next([...currentImages, createdImage]);
        })
      );
  }

  deleteImage(imageId: string): void {
    this.http.delete(`${this.apiUrl}/gallery/${imageId}`).subscribe(
      () => {
        const currentImages = this.imagesSubject.getValue();
        const updatedImages = currentImages.filter(
          (img) => img._id !== imageId
        );
        this.imagesSubject.next(updatedImages);
      },
      (error) => {
        console.error("Erreur lors de la suppression de l'image:", error);
      }
    );
  }

  updateImage(image: GalleryImage): Observable<GalleryImage> {
    if (!image._id) {
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
          const currentImages = this.imagesSubject.getValue();
          const index = currentImages.findIndex(
            (img) => img._id === updatedImage._id
          );
          if (index !== -1) {
            currentImages[index] = updatedImage;
            this.imagesSubject.next([...currentImages]);
          }
        })
      );
  }
}
