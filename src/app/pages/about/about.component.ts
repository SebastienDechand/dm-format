import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { About } from '../../models/about.models';
import { AdminService } from '../../services/admin.service';
import { EditModeService } from '../../services/edit-mode.service';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-about',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);

  aboutData!: About;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.editModeService.editMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((editMode) => {
        this.editMode = editMode;
      });

    this.apiService.getAbout().subscribe(
      (data) => {
        this.aboutData = data;
      },
      (error) => {
        console.error('Error fetching about page data', error);
      }
    );
  }

  toggleEditMode(field: string) {
    if (this.isAdmin$) {
      this.editModeService.toggleEditMode(field);
    }
  }

  saveChanges() {
    this.apiService.patchAbout(this.aboutData).subscribe(
      (data) => {
        this.aboutData = data;
        this.editModeService.resetEditModes();
        alert('Changes saved successfully');
      },
      (error) => {
        console.error('Error saving about page data', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
