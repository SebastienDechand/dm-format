import { Injectable, inject } from '@angular/core';
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
import { environment } from '../../environments/environment';

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
    // console.log('GalleryService instancié');
    this.loadGallery();
  }

  public loadGallery(): void {
    // console.log("Chargement de la galerie depuis l'API");
    this.http
      .get<GalleryImage[]>(`${this.apiUrl}/gallery`)
      .pipe(
        // tap((images) => console.log('API: Images reçues:', images)),
        catchError((error) => {
          console.error("Erreur lors du chargement depuis l'API:", error);
          return of([]);
        })
      )
      .subscribe((images) => {
        // console.log('Images mises à jour dans le subject');
        this.imagesSubject.next(images);
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
          // console.log("Image créée dans l'API:", createdImage);
          const currentImages = this.imagesSubject.getValue();
          this.imagesSubject.next([...currentImages, createdImage]);
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
        // console.log('Image supprimée avec succès');
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
          // console.log("Image mise à jour dans l'API:", updatedImage);
          const currentImages = this.imagesSubject.getValue();
          const index = currentImages.findIndex(
            (img) => img._id === updatedImage._id
          );
          if (index !== -1) {
            currentImages[index] = updatedImage;
            this.imagesSubject.next([...currentImages]);
          }
        }),
        catchError((error) => {
          console.error("Erreur lors de la mise à jour de l'image:", error);
          throw error;
        })
      );
  }
}
