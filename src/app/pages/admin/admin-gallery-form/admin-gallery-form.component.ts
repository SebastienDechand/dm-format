import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GalleryService } from '../../../services/gallery.service';
import { ToastService } from '../../../services/toast.service';
import { GalleryImage } from '../../../models/gallery.models';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import {
  LucideDynamicIcon,
  LucideTrash2,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-gallery-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideTrash2)],
  templateUrl: './admin-gallery-form.component.html',
  styleUrl: './admin-gallery-form.component.scss',
})
export class AdminGalleryFormComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  image?: GalleryImage;
  saving = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.galleryService.getImageById(id).subscribe({
      next: (image) => {
        this.image = { ...image };
      },
      error: () => {
        this.toast.error('Image introuvable.');
        this.router.navigate(['/admin/gallery']);
      },
    });
  }

  save(): void {
    if (!this.image) return;

    this.saving = true;
    this.galleryService.updateImage(this.image).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Image enregistrée avec succès !');
      },
      error: () => {
        this.saving = false;
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }

  deleteImage(): void {
    if (!this.image?._id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Êtes-vous sûr de vouloir supprimer l'image "${this.image.title}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.image?._id) {
        this.galleryService.deleteImage(this.image._id);
        this.toast.success('Image supprimée avec succès !');
        this.router.navigate(['/admin/gallery']);
      }
    });
  }
}
