import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-certification',
  imports: [CommonModule, SafeHtmlPipe, EditButtonComponent, FormsModule],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss',
  standalone: true,
})
export class CertificationComponent {
  private adminService: AdminService = inject(AdminService);

  @Input() certificationData: any;
  @Output() editClicked = new EventEmitter<void>();

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }
}
