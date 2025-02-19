import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GalleryImage } from '../../models/gallery.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [CommonModule],
})
export class GalleryComponent implements OnInit {
  images: GalleryImage[] = [];
  selectedImage: GalleryImage | null = null;
  currentImageIndex: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getGallery().subscribe((data) => {
      this.images = data;
    });
  }

  openLightbox(image: GalleryImage, index: number): void {
    this.selectedImage = image;
    this.currentImageIndex = index;
  }

  closeLightbox(): void {
    this.selectedImage = null;
  }

  nextImage(): void {
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
      this.selectedImage = this.images[this.currentImageIndex];
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.selectedImage = this.images[this.currentImageIndex];
    }
  }
}
