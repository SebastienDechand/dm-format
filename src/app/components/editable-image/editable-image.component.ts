// src/app/components/editable-image/editable-image.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-editable-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editable-image.component.html',
  styleUrls: ['./editable-image.component.scss'],
})
export class EditableImageComponent implements OnInit {
  @Input() pageId: string = '';
  @Input() imageSrc: string = '';
  @Input() altText: string = '';
  @Input() imageClass: string = '';
  @Input() isEditable: boolean = false;
  @Output() imageUploaded = new EventEmitter<{
    url: string;
    altText: string;
  }>();

  isUploading: boolean = false;

  constructor(private imageUploadService: ImageUploadService) {}

  ngOnInit(): void {
    // Si aucune image n'est fournie, essayer de la récupérer via le service
    if (!this.imageSrc && this.pageId) {
      this.imageUploadService.getPageImage(this.pageId).subscribe({
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
    if (!this.isEditable || this.isUploading) {
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
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    this.isUploading = true;

    this.imageUploadService
      .uploadPageImage(this.pageId, file, this.altText)

      .subscribe({
        next: (response) => {
          this.imageSrc = response.imageUrl;
          this.altText = response.altText || this.altText;
          this.isUploading = false;
          this.imageUploaded.emit({
            url: response.imageUrl,
            altText: response.altText,
          });
        },
        error: (error) => {
          console.error("Erreur lors de l'upload", error);
          this.isUploading = false;
          alert("Erreur lors de l'upload. Veuillez réessayer.");
        },
      });
  }
}
