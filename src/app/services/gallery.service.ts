import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {
    this.loadGallery();
  }

  private loadGallery(): void {
    if (typeof window !== 'undefined') {
      const savedGallery = localStorage.getItem('gallery');
      const images = savedGallery ? JSON.parse(savedGallery) : [];
      this.imagesSubject.next(images);
    }
  }

  private saveGallery(images: GalleryImage[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gallery', JSON.stringify(images));
      this.imagesSubject.next(images);
    }
  }

  uploadImage(file: File): Observable<GalleryImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return new Observable<GalleryImage>((observer) => {
      this.http
        .post(
          `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
          formData
        )
        .subscribe(
          (response: any) => {
            const newImage: GalleryImage = {
              id: response.public_id,
              title: 'Nouvelle image',
              description: 'Ajoutée via l’interface',
              src: response.secure_url,
            };
            const updatedImages = [...this.imagesSubject.getValue(), newImage];
            this.saveGallery(updatedImages);
            observer.next(newImage);
            observer.complete();
          },
          (error) => {
            console.error("Erreur d'upload Cloudinary :", error);
            observer.error(error);
          }
        );
    });
  }

  deleteImage(index: number): void {
    const updatedImages = this.imagesSubject
      .getValue()
      .filter((_, i) => i !== index);
    this.saveGallery(updatedImages);
  }
}
