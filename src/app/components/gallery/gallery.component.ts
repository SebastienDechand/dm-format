import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  PLATFORM_ID,
} from '@angular/core';
import { GalleryImage } from '../../models/gallery.models';
import { AdminService } from '../../services/admin.service';
import { GalleryService } from '../../services/gallery.service';
import { ConfirmDialogGalleryComponent } from '../confirm-dialog-gallery/confirm-dialog-gallery.component';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LucideAngularModule, Trash2, X, Upload } from 'lucide-angular';
@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [CommonModule, ConfirmDialogGalleryComponent, LucideAngularModule],
  providers: [LucideAngularModule.pick({ Trash2, X, Upload }).providers ?? []],
})
export class GalleryComponent implements OnInit, OnChanges, AfterViewInit {
  private galleryService = inject(GalleryService);
  private platformId = inject<Object>(PLATFORM_ID);

  readonly images = this.galleryService.images;
  readonly isLoading = this.galleryService.loading;
  selectedImage: GalleryImage | null = null;
  showDeleteModal: boolean = false;
  deleteImageId: string | null = null;
  cloudName = environment.cloudinary.cloudName;
  uploadPreset = environment.cloudinary.upload_preset;
  isDesktop = false;
  private isBrowser: boolean;
  private breakpointObserver = inject(BreakpointObserver);

  private adminService: AdminService = inject(AdminService);
  readonly isAdmin = this.adminService.isAdmin;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadImages();

    if (this.isBrowser) {
      this.breakpointObserver
        .observe(['(min-width: 1024px)'])
        .subscribe((result) => {
          this.isDesktop = result.matches;
        });
    }
  }

  ngAfterViewInit(): void {
    // Recharger les images après le rendu de la vue pour s'assurer que tout est prêt
    setTimeout(() => {
      this.loadImages();
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recharger les images si certaines propriétés changent
    this.loadImages();
  }

  loadImages(): void {
    this.galleryService.loadGallery();
  }

  openLightbox(image: GalleryImage): void {
    this.selectedImage = image;
  }

  closeLightbox(): void {
    this.selectedImage = null;
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    this.galleryService.uploadImage(file).subscribe({
      next: (image) => console.log('Image uploadée avec succès:', image),
      error: (error) => console.error("Erreur lors de l'upload:", error),
    });
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

  // Méthode pour forcer le rechargement des images
  refreshGallery(): void {
    this.loadImages();
  }
}
