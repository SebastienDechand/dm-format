import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GalleryImage } from '../../models/gallery.models';
import { AdminService } from '../../services/admin.service';
import { GalleryService } from '../../services/gallery.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [CommonModule, ConfirmDialogComponent],
})
export class GalleryComponent implements OnInit {
  images: GalleryImage[] = [];
  selectedImage: GalleryImage | null = null;
  currentImageIndex: number = 0;
  showDeleteModal: boolean = false;
  deleteImageId: string | null = null;
  cloudName = environment.cloudinary.cloudName;
  uploadPreset = environment.cloudinary.upload_preset;

  private adminService: AdminService = inject(AdminService);
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.galleryService.images$.subscribe((images) => {
      console.log('Images reçues dans le composant:', images);
      this.images = images;
    });
  }

  openLightbox(image: GalleryImage): void {
    this.selectedImage = image;
  }

  closeLightbox(): void {
    this.selectedImage = null;
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    this.galleryService.uploadImage(file).subscribe();
  }

  deleteImage(imageId: string): void {
    if (imageId) {
      this.galleryService.deleteImage(imageId);
    }
  }

  openDeleteModal(imageId: string) {
    this.deleteImageId = imageId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteImageId = null;
  }

  confirmDelete() {
    if (this.deleteImageId) {
      this.galleryService.deleteImage(this.deleteImageId);
    }
    this.closeDeleteModal();
  }
}
