import { Component, inject, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditButtonComponent } from '../edit-button/edit-button.component';
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
  readonly editClicked = output<void>();

  readonly isAdmin = this.adminService.isAdmin;
  editMode: { [key: string]: boolean } = {};

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }
}
