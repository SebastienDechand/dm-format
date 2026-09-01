import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { AdminService } from '../../services/admin.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { EditableImageComponent } from '../editable-image/editable-image.component';
import { AutoResizeDirective } from '../../directives/auto-resize.directive';

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
  ],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  private adminService: AdminService = inject(AdminService);

  @Input() bannerData: any;
  @Input() pageId: string = 'home-banner';
  @Output() editClicked = new EventEmitter<void>();
  @Output() imageUploaded = new EventEmitter<{
    url: string;
    altText: string;
  }>();

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  imageRefreshTrigger: boolean = true;

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }

  trackByIndex(index: number, _item: unknown): number {
    return index;
  }

  onImageUploaded(imageData: { url: string; altText: string }) {
    this.imageUploaded.emit(imageData);

    this.imageRefreshTrigger = false;
    setTimeout(() => (this.imageRefreshTrigger = true), 50);
  }
}
