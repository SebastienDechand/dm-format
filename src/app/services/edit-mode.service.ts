import { inject, Injectable, signal } from '@angular/core';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root',
})
export class EditModeService {
  private adminService: AdminService = inject(AdminService);

  readonly editMode = signal<{ [key: string]: boolean }>({});

  toggleEditMode(field: string): void {
    if (!this.adminService.isAdmin()) return;
    this.editMode.update((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  resetEditModes(): void {
    this.editMode.set({});
  }
}
