import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
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
import {
  LucideDynamicIcon,
  LucideX,
  LucideChevronLeft,
  LucideChevronRight,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [CommonModule, LucideDynamicIcon],
  providers: [
    provideLucideIcons(LucideX, LucideChevronLeft, LucideChevronRight),
  ],
})
export class GalleryComponent implements OnInit, OnChanges, AfterViewInit {
  private galleryService = inject(GalleryService);
  private platformId = inject<Object>(PLATFORM_ID);

  readonly images = this.galleryService.images;
  readonly isLoading = this.galleryService.loading;
  selectedIndex: number | null = null;
  isZoomed = false;
  zoomOriginX = 50;
  zoomOriginY = 50;
  isDesktop = false;
  private isBrowser: boolean;
  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get selectedImage(): GalleryImage | null {
    return this.selectedIndex === null
      ? null
      : (this.images()[this.selectedIndex] ?? null);
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
    this.selectedIndex = this.images().findIndex((img) => img === image);
    this.isZoomed = false;
  }

  closeLightbox(): void {
    this.selectedIndex = null;
    this.isZoomed = false;
  }

  showPrev(): void {
    if (this.selectedIndex === null) return;
    const count = this.images().length;
    this.selectedIndex = (this.selectedIndex - 1 + count) % count;
    this.isZoomed = false;
  }

  showNext(): void {
    if (this.selectedIndex === null) return;
    const count = this.images().length;
    this.selectedIndex = (this.selectedIndex + 1) % count;
    this.isZoomed = false;
  }

  toggleZoom(event: MouseEvent): void {
    if (!this.isZoomed) {
      this.updateZoomOrigin(event);
    }
    this.isZoomed = !this.isZoomed;
  }

  onZoomedMouseMove(event: MouseEvent): void {
    if (this.isZoomed) {
      this.updateZoomOrigin(event);
    }
  }

  private updateZoomOrigin(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.zoomOriginX = ((event.clientX - rect.left) / rect.width) * 100;
    this.zoomOriginY = ((event.clientY - rect.top) / rect.height) * 100;
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.selectedIndex === null) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.showPrev();
        break;
      case 'ArrowRight':
        this.showNext();
        break;
    }
  }

  // Méthode pour forcer le rechargement des images
  refreshGallery(): void {
    this.loadImages();
  }
}
