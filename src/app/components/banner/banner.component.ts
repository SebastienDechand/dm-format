import { CommonModule } from '@angular/common';
import { Component, inject, Input, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { AdminService } from '../../services/admin.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { EditableImageComponent } from '../editable-image/editable-image.component';
import { AutoResizeDirective } from '../../directives/auto-resize.directive';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditButtonComponent,
    SafeHtmlPipe,
    EditableImageComponent,
    AutoResizeDirective,
    LucideAngularModule,
  ],
  providers: [LucideAngularModule.pick({ Check }).providers ?? []],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  private adminService: AdminService = inject(AdminService);

  @Input() bannerData: any;
  readonly pageId = input<string>('home-banner');
  readonly editClicked = output<void>();
  readonly imageUploaded = output<{
    url: string;
    altText: string;
  }>();

  readonly isAdmin = this.adminService.isAdmin;
  editMode: { [key: string]: boolean } = {};

  imageRefreshTrigger: boolean = true;

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onImageUploaded(imageData: { url: string; altText: string }) {
    this.imageUploaded.emit(imageData);

    this.imageRefreshTrigger = false;
    setTimeout(() => (this.imageRefreshTrigger = true), 50);
  }
}
