import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root',
})
export class EditModeService {
  private adminService: AdminService = inject(AdminService);

  private editModeSubject = new BehaviorSubject<{ [key: string]: boolean }>({});
  editMode$ = this.editModeSubject.asObservable();

  private isAdmin$ = this.adminService.isAdminMode$;

  toggleEditMode(field: string) {
    this.isAdmin$.subscribe((isAdmin) => {
      if (!isAdmin) return;
      const currentEditMode = this.editModeSubject.value;
      this.editModeSubject.next({
        ...currentEditMode,
        [field]: !currentEditMode[field],
      });
    });
  }

  resetEditModes() {
    this.editModeSubject.next({});
  }
}
