// src/app/components/editable-image/editable-image.component.ts
import { Component, Input, OnInit, inject, input, output } from '@angular/core';

import { ImageUploadService } from '../../services/image-upload.service';
import { ToastService } from '../../services/toast.service';
import { LucideAngularModule, LoaderCircle, Camera } from 'lucide-angular';

@Component({
  selector: 'app-editable-image',
  standalone: true,
  imports: [LucideAngularModule],
  providers: [
    LucideAngularModule.pick({ LoaderCircle, Camera }).providers ?? [],
  ],
  templateUrl: './editable-image.component.html',
  styleUrls: ['./editable-image.component.scss'],
})
export class EditableImageComponent implements OnInit {
  private toast = inject(ToastService);

  readonly pageId = input<string>('');
  @Input() imageSrc: string = '';
  @Input() altText: string = '';
  readonly imageClass = input<string>('');
  readonly isEditable = input<boolean>(false);
  readonly imageUploaded = output<{
    url: string;
    altText: string;
  }>();

  isUploading: boolean = false;

  constructor(private imageUploadService: ImageUploadService) {}

  ngOnInit(): void {
    // Si aucune image n'est fournie, essayer de la récupérer via le service
    const pageId = this.pageId();
    if (!this.imageSrc && pageId) {
      this.imageUploadService.getPageImage(pageId).subscribe({
        next: (imageData) => {
          this.imageSrc = imageData.imageUrl;
          this.altText = imageData.altText || this.altText;
        },
        error: () => {
          // Image non trouvée, utiliser l'image par défaut ou laisser vide
        },
      });
    }
  }

  openFileSelector(): void {
    if (!this.isEditable() || this.isUploading) {
      return;
    }

    // Créer dynamiquement un input file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        this.uploadImage(input.files[0]);
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();

    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(fileInput);
    }, 1000);
  }

  private uploadImage(file: File): void {
    // Vérifications basiques
    if (!file.type.startsWith('image/')) {
      this.toast.error('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    this.isUploading = true;

    this.imageUploadService
      .uploadPageImage(this.pageId(), file, this.altText)

      .subscribe({
        next: (response) => {
          this.imageSrc = response.imageUrl;
          this.altText = response.altText || this.altText;
          this.isUploading = false;
          this.imageUploaded.emit({
            url: response.data.imageUrl,
            altText: response.data.altText,
          });
        },
        error: (error) => {
          console.error("Erreur lors de l'upload", error);
          this.isUploading = false;
          this.toast.error("Erreur lors de l'upload. Veuillez réessayer.");
        },
      });
  }
}
