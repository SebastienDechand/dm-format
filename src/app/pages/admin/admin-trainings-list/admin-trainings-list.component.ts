import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { Program } from '../../../models/programs.models';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucidePencil,
  LucideTrash2,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-trainings-list',
  standalone: true,
  imports: [RouterLink, LucideDynamicIcon],
  providers: [provideLucideIcons(LucidePlus, LucidePencil, LucideTrash2)],
  templateUrl: './admin-trainings-list.component.html',
  styleUrl: './admin-trainings-list.component.scss',
})
export class AdminTrainingsListComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  readonly trainings = signal<Program[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadTrainings();
  }

  private loadTrainings(): void {
    this.loading.set(true);
    this.apiService.getPrograms().subscribe({
      next: (data) => {
        this.trainings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Impossible de charger les formations.');
        this.loading.set(false);
      },
    });
  }

  deleteTraining(program: Program): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Êtes-vous sûr de vouloir supprimer la formation "${program.title}" ? Cette action est irréversible.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.apiService.deleteProgram(program._id).subscribe({
        next: () => {
          this.trainings.update((list) =>
            list.filter((p) => p._id !== program._id)
          );
          this.toast.success('Formation supprimée avec succès !');
        },
        error: () => {
          this.toast.error('Erreur lors de la suppression.');
        },
      });
    });
  }
}
