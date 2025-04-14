import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { Observable } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { AutoResizeDirective } from '../../directives/auto-resize.directive';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [
    FormsModule,
    EditButtonComponent,
    CommonModule,
    AutoResizeDirective,
  ],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss',
})
export class PartnerComponent {
  private adminService: AdminService = inject(AdminService);

  @Input() partnerData: any;
  @Output() editClicked = new EventEmitter<void>();

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }
}
