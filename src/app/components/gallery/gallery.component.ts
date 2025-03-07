import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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

  private subscription: Subscription = new Subscription();
  private adminService: AdminService = inject(AdminService);
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;

  constructor(private galleryService: GalleryService) {
    console.log('GalleryComponent construit');
  }

  ngOnInit(): void {
    console.log('GalleryComponent ngOnInit');
    this.loadImages();
  }

  ngAfterViewInit(): void {
    console.log('GalleryComponent ngAfterViewInit');
    // Recharger les images après le rendu de la vue pour s'assurer que tout est prêt
    setTimeout(() => {
      this.loadImages();
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('GalleryComponent ngOnChanges', changes);
    // Recharger les images si certaines propriétés changent
    this.loadImages();
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscription.unsubscribe();
  }

  loadImages(): void {
    console.log('Chargement des images demandé');
    this.isLoading = true;

    // Déclencher explicitement le chargement depuis le service
    this.galleryService.loadGallery();

    // Gérer la souscription
    this.subscription.add(
      this.galleryService.images$.subscribe({
        next: (images) => {
          console.log('Images reçues dans le composant:', images);
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
    console.log("Ouverture lightbox pour l'image:", image);
    this.selectedImage = image;
  }

  closeLightbox(): void {
    console.log('Fermeture lightbox');
    this.selectedImage = null;
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      console.log('Aucun fichier sélectionné');
      return;
    }

    console.log("Upload de l'image:", file.name);
    this.galleryService.uploadImage(file).subscribe({
      next: (image) => console.log('Image uploadée avec succès:', image),
      error: (error) => console.error("Erreur lors de l'upload:", error),
    });
  }

  openDeleteModal(imageId: string) {
    console.log("Ouverture modal suppression pour l'image:", imageId);
    this.deleteImageId = imageId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    console.log('Fermeture modal suppression');
    this.showDeleteModal = false;
    this.deleteImageId = null;
  }

  confirmDelete() {
    if (this.deleteImageId) {
      console.log('Confirmation suppression image:', this.deleteImageId);
      this.galleryService.deleteImage(this.deleteImageId);
    }
    this.closeDeleteModal();
  }

  // Méthode pour forcer le rechargement des images
  refreshGallery(): void {
    console.log('Actualisation forcée de la galerie');
    this.loadImages();
  }
}
