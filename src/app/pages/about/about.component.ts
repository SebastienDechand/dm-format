import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { About } from '../../models/about.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, FormsModule, EditButtonComponent],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
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
}
