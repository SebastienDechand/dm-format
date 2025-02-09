import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent implements OnInit {
  @Input() bannerData: any;
  safeTitle: SafeHtml | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.bannerData?.title) {
      this.safeTitle = this.sanitizer.bypassSecurityTrustHtml(
        this.bannerData.title
      );
    }
  }
}
