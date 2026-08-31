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
import { GalleryService } from '../../services/gallery.service';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LucideDynamicIcon, LucideX, provideLucideIcons } from '@lucide/angular';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [CommonModule, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideX)],
})
export class GalleryComponent implements OnInit, OnChanges, AfterViewInit {
  private galleryService = inject(GalleryService);
  private platformId = inject<Object>(PLATFORM_ID);

  readonly images = this.galleryService.images;
  readonly isLoading = this.galleryService.loading;
  selectedImage: GalleryImage | null = null;
  isDesktop = false;
  private isBrowser: boolean;
  private breakpointObserver = inject(BreakpointObserver);

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

  // Méthode pour forcer le rechargement des images
  refreshGallery(): void {
    this.loadImages();
  }
}
