import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { LucideDynamicIcon, LucideCheck, provideLucideIcons } from '@lucide/angular';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideCheck)],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  @Input() bannerData: any;

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
