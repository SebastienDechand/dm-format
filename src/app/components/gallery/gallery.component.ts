import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryImage } from '../../models/gallery.models';
import { GalleryService } from '../../services/gallery.service';

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

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.galleryService.getGalleryImages().subscribe((data) => {
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
