import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { ConditionsData } from '../../models/organisation.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-organisation',
  standalone: true,
  imports: [CommonModule, FormsModule, EditButtonComponent, SafeHtmlPipe],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss',
})
export class OrganisationComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);

  organisationData!: ConditionsData;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.editModeService.editMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((editMode) => {
        this.editMode = editMode;
      });

    this.apiService.getOrganisation().subscribe(
      (data) => {
        this.organisationData = data;
      },
      (error) => {
        console.error('Error fetching organisation page data', error);
      }
    );
  }

  toggleEditMode(field: string) {
    if (this.isAdmin$) {
      this.editModeService.toggleEditMode(field);
    }
  }

  saveChanges() {
    this.apiService.patchOrganisation(this.organisationData).subscribe(
      (data) => {
        this.organisationData = data;
        this.editModeService.resetEditModes();
        alert('Modifications sauvegardées avec succès');
      },
      (error) => {
        console.error('Error saving organisation page data', error);
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
