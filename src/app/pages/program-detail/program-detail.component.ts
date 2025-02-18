import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil, switchMap } from 'rxjs';
import { EditButtonComponent } from '../../components/edit-button/edit-button.component';
import { Program } from '../../models/programs.models';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../services/api.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, EditButtonComponent],
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
})
export class ProgramDetailComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  private adminService: AdminService = inject(AdminService);
  private editModeService: EditModeService = inject(EditModeService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  program?: Program;
  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;
  editMode: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.editModeService.editMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((editMode) => {
        this.editMode = editMode;
      });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          return id ? this.apiService.getProgramById(id) : [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (data) => {
          this.program = data;
        },
        (error) => {
          console.error('Error fetching program data', error);
        }
      );
  }

  toggleEditMode(field: string) {
    this.editModeService.toggleEditMode(field);
  }

  saveChanges() {
    if (this.program) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.apiService.patchProgramById(id, this.program).subscribe(
          (data) => {
            this.program = data;
            this.editModeService.resetEditModes();
            alert('Changes saved successfully');
          },
          (error) => {
            console.error('Error saving program data', error);
          }
        );
      }
    }
  }

  getBackgroundImage(program: Program | undefined): string {
    return program ? `url(${program.banner})` : '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
