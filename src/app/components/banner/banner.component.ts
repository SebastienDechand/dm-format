import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { HtmlSanitizerService } from '../../services/html-sanitizer.service';
import {
  LucideDynamicIcon,
  LucideCheck,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideCheck)],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  private sanitizerService = inject(HtmlSanitizerService);

  @Input() bannerData: any;

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }

  get safeTitle(): string {
    return this.sanitizerService.sanitize(this.bannerData?.title || '');
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
