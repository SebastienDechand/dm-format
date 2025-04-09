import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { CalendarService } from '../../services/calendar.service';
import { Training } from '../../models/calendar.model';
import { Observable } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatTooltipModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  private adminService: AdminService = inject(AdminService);

  trainings: Training[] = [];
  selectedDate: Date = new Date();
  isCalendarVisible: boolean = false;
  isAddFormVisible: boolean = false;
  newTraining: Training = {
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    description: '',
  };
  tooltipX: number = 0;
  tooltipY: number = 0;
  showTooltip: boolean = false;
  currentTooltipTrainings: Training[] = [];
  tooltipText: string = '';
  hoveredDate: Date | null = null;

  isAdmin$: Observable<boolean> = this.adminService.isAdminMode$;

  constructor(
    private trainingService: CalendarService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  @ViewChild(MatCalendar) set calendarInstance(calendar: MatCalendar<Date>) {
    if (calendar) {
      calendar.stateChanges.subscribe(() => {
        this.applyStylesToCells();
      });
    }
  }

  ngOnInit(): void {
    this.loadTrainings();
  }

  ngAfterViewInit() {
    if (this.calendar) {
      this.calendar.updateTodaysDate();
    }
  }

  applyStylesToCells() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const cells = document.querySelectorAll('.mat-calendar-body-cell');

        cells.forEach((cell) => {
          cell.classList.remove('has-event');
        });

        cells.forEach((cell) => {
          const ariaLabel = cell.getAttribute('aria-label');
          if (ariaLabel) {
            try {
              const dateParts = ariaLabel.split(' ');
              if (dateParts.length >= 3) {
                const day = parseInt(dateParts[0]);
                const month = this.getMonthNumber(dateParts[1]);
                const year = parseInt(dateParts[2]);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                  const date = new Date(year, month, day);

                  if (this.getTrainingsForDate(date).length > 0) {
                    cell.classList.add('has-event');

                    const cellContent = cell.querySelector(
                      '.mat-calendar-body-cell-content'
                    );
                    if (cellContent) {
                      cellContent.classList.add('has-event-content');
                    }
                  }
                }
              }
            } catch (e) {
              console.error("Erreur lors de l'analyse de la date:", e);
            }
          }
        });
      }, 100);
    }
  }

  loadTrainings(): void {
    this.trainingService.getTrainings().subscribe(
      (data: Training[]) => {
        this.trainings = data;

        setTimeout(() => {
          this.refreshCalendar();

          this.applyStylesToCells();
        }, 300);
      },
      (error) => {
        console.error('Error fetching trainings:', error);
      }
    );
  }

  toggleCalendar(): void {
    this.isCalendarVisible = !this.isCalendarVisible;
  }

  toggleAddForm(): void {
    this.isAddFormVisible = !this.isAddFormVisible;

    if (this.isAddFormVisible) {
      this.newTraining = {
        title: '',
        startDate: new Date(),
        endDate: new Date(),
        description: '',
      };

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const formElement = document.querySelector('.calendar-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }

  refreshCalendar(): void {
    const currentDate = this.selectedDate;

    this.selectedDate = new Date(currentDate.getTime() + 86400000);

    if (this.changeDetectorRef) {
      this.changeDetectorRef.detectChanges();
    }

    setTimeout(() => {
      this.selectedDate = currentDate;

      if (this.changeDetectorRef) {
        this.changeDetectorRef.detectChanges();
      }
    }, 10);
  }

  generateTooltipForDate(date: Date): void {
    this.currentTooltipTrainings = this.getTrainingsForDate(date);
  }

  getDurationInDays(training: Training): number {
    if (!training.startDate || !training.endDate) return 0;

    const startDate = new Date(training.startDate);
    const endDate = new Date(training.endDate);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  onDateHover(event: any): void {
    if (event && event.target) {
      let targetEl = event.target;

      while (
        targetEl &&
        !targetEl.classList.contains('mat-calendar-body-cell')
      ) {
        targetEl = targetEl.parentElement;
        if (!targetEl) break;
      }

      if (targetEl && targetEl.getAttribute('aria-label')) {
        try {
          const ariaLabel = targetEl.getAttribute('aria-label');
          const dateParts = ariaLabel.split(' ');

          if (dateParts.length >= 3) {
            const day = parseInt(dateParts[0]);
            const month = this.getMonthNumber(dateParts[1]);
            const year = parseInt(dateParts[2]);

            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              const date = new Date(year, month, day);
              this.hoveredDate = date;
              this.generateTooltipForDate(date);

              this.tooltipX = event.clientX - 150;
              this.tooltipY = event.clientY - 100;
              this.showTooltip = true;
            }
          }
        } catch (e) {
          console.error("Erreur lors de l'analyse de la date:", e);
        }
      }
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeaveCalendar(event: any): void {
    this.showTooltip = false;
  }

  private getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      janvier: 0,
      février: 1,
      mars: 2,
      avril: 3,
      mai: 4,
      juin: 5,
      juillet: 6,
      août: 7,
      septembre: 8,
      octobre: 9,
      novembre: 10,
      décembre: 11,
    };
    return months[monthName.toLowerCase() as keyof typeof months] || 0;
  }

  dateClass = (date: Date): MatCalendarCellCssClasses => {
    if (!date || !this.trainings || this.trainings.length === 0) {
      return {};
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const timeStamp = normalizedDate.getTime();

    const hasEvent = this.trainings.some((training) => {
      if (!training.startDate || !training.endDate) return false;

      const startDate = new Date(training.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(training.endDate);
      endDate.setHours(23, 59, 59, 999);

      return timeStamp >= startDate.getTime() && timeStamp <= endDate.getTime();
    });

    return hasEvent ? { 'has-event': true } : {};
  };

  getTrainingsForDate(date: Date): Training[] {
    if (!date) return [];

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const timeStamp = normalizedDate.getTime();

    return this.trainings.filter((training) => {
      if (!training.startDate || !training.endDate) return false;

      const startDate = new Date(training.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(training.endDate);
      endDate.setHours(23, 59, 59, 999);

      return timeStamp >= startDate.getTime() && timeStamp <= endDate.getTime();
    });
  }

  onDateSelected(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
    }
  }

  addTraining(): void {
    if (!this.newTraining.startDate || !this.newTraining.endDate) {
      this.toast.error('Les dates de début et de fin sont obligatoires');
      return;
    }

    const trainingToAdd = { ...this.newTraining };

    trainingToAdd.startDate = new Date(trainingToAdd.startDate);
    trainingToAdd.endDate = new Date(trainingToAdd.endDate);

    trainingToAdd.startDate.setHours(0, 0, 0, 0);
    trainingToAdd.endDate.setHours(23, 59, 59, 999);

    if (trainingToAdd.endDate < trainingToAdd.startDate) {
      const tempDate = trainingToAdd.startDate;
      trainingToAdd.startDate = trainingToAdd.endDate;
      trainingToAdd.endDate = tempDate;
    }

    this.trainingService.createTraining(trainingToAdd).subscribe(
      (response) => {
        this.toggleAddForm();
        this.trainings = [...this.trainings, response ?? trainingToAdd];
        setTimeout(() => {
          this.refreshCalendar();
        }, 10);
        this.loadTrainings();
        this.toast.success('Formation ajoutée avec succès !');
      },
      (error) => {
        console.error('Error adding training:', error);
        this.toast.error("Erreur lors de l'ajout de la formation");
      }
    );
  }

  deleteTraining(id: string | undefined): void {
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Êtes-vous sûr de vouloir supprimer cette formation ?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.trainingService.deleteTraining(id).subscribe(
          () => {
            this.showTooltip = false;
            this.loadTrainings();
            this.toast.success('Formation supprimée !');
          },
          (error) => {
            console.error('Error deleting training:', error);
            this.toast.error('Erreur lors de la suppression de la formation');
          }
        );
      }
    });
  }
}
