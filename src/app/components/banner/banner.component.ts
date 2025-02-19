import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { AdminService } from '../../services/admin.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, EditButtonComponent, SafeHtmlPipe],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  private adminService: AdminService = inject(AdminService);

  @Input() bannerData: any;
  @Output() editClicked = new EventEmitter<void>();

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }
}
