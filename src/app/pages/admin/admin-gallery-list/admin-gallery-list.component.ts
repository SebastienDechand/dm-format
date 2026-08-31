import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GalleryService } from '../../../services/gallery.service';
import { ToastService } from '../../../services/toast.service';
import { GalleryImage } from '../../../models/gallery.models';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import {
  LucideDynamicIcon,
  LucideUpload,
  LucidePencil,
  LucideTrash2,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-gallery-list',
  standalone: true,
  imports: [RouterLink, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideUpload, LucidePencil, LucideTrash2)],
  templateUrl: './admin-gallery-list.component.html',
  styleUrl: './admin-gallery-list.component.scss',
})
export class AdminGalleryListComponent {
  private galleryService = inject(GalleryService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  readonly images = this.galleryService.images;
  readonly loading = this.galleryService.loading;

  uploading = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;
    this.galleryService.uploadImage(file).subscribe({
      next: (image) => {
        this.uploading = false;
        input.value = '';
        this.toast.success('Image ajoutée avec succès !');
        this.router.navigate(['/admin/gallery', image._id]);
      },
      error: () => {
        this.uploading = false;
        input.value = '';
        this.toast.error("Erreur lors de l'ajout de l'image.");
      },
    });
  }

  deleteImage(image: GalleryImage): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Êtes-vous sûr de vouloir supprimer l'image "${image.title}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && image._id) {
        this.galleryService.deleteImage(image._id);
        this.toast.success('Image supprimée avec succès !');
      }
    });
  }
}
