import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GalleryImage } from '../../models/gallery.models';
import { AdminService } from '../../services/admin.service';
import { GalleryService } from '../../services/gallery.service';
import { ConfirmDialogGalleryComponent } from '../confirm-dialog-gallery/confirm-dialog-gallery.component';
import { environment } from '../../../environments/environment.prod';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [CommonModule, ConfirmDialogGalleryComponent],
})
export class GalleryComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  images: GalleryImage[] = [];
  selectedImage: GalleryImage | null = null;
  showDeleteModal: boolean = false;
  deleteImageId: string | null = null;
  cloudName = environment.cloudinary.cloudName;
  uploadPreset = environment.cloudinary.upload_preset;
  isLoading: boolean = true;
  isDesktop = false;
  private isBrowser: boolean;
  private breakpointObserver = inject(BreakpointObserver);

  private subscription: Subscription = new Subscription();
  private adminService: AdminService = inject(AdminService);
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;

  constructor(
    private galleryService: GalleryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
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

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscription.unsubscribe();
  }

  loadImages(): void {
    this.isLoading = true;

    // Déclencher explicitement le chargement depuis le service
    this.galleryService.loadGallery();

    // Gérer la souscription
    this.subscription.add(
      this.galleryService.images$.subscribe({
        next: (images) => {
          this.images = images;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des images:', error);
          this.isLoading = false;
        },
      })
    );
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
