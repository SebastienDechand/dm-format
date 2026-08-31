import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TestimonialService } from '../../../services/testimonial.service';
import { ToastService } from '../../../services/toast.service';
import { Testimonial } from '../../../models/testimonials.model';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import {
  LucideDynamicIcon,
  LucideCheck,
  LucideTrash2,
  LucideUndo2,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-testimonials-list',
  standalone: true,
  imports: [RouterLink, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideCheck, LucideTrash2, LucideUndo2)],
  templateUrl: './admin-testimonials-list.component.html',
  styleUrl: './admin-testimonials-list.component.scss',
})
export class AdminTestimonialsListComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  readonly testimonials = signal<Testimonial[]>([]);
  readonly loading = signal(true);
  readonly approvingAll = signal(false);

  readonly pendingCount = computed(
    () => this.testimonials().filter((t) => !t.approved).length
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.testimonialService.getAllForAdmin().subscribe({
      next: (res) => {
        this.testimonials.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Impossible de charger les témoignages.');
        this.loading.set(false);
      },
    });
  }

  idOf(testimonial: Testimonial): string {
    const id = testimonial._id;
    if (!id) return '';
    return typeof id === 'string' ? id : id.$oid;
  }

  trainingTitle(testimonial: Testimonial): string {
    const trainingId = testimonial.trainingId;
    if (trainingId && typeof trainingId === 'object' && 'title' in trainingId) {
      return trainingId.title;
    }
    return 'Formation supprimée';
  }

  trainingLink(testimonial: Testimonial): string[] | null {
    const trainingId = testimonial.trainingId;
    if (trainingId && typeof trainingId === 'object' && '_id' in trainingId) {
      return ['/trainings', trainingId._id];
    }
    return null;
  }

  approve(testimonial: Testimonial): void {
    const id = this.idOf(testimonial);
    if (!id) return;

    this.testimonialService.setApproved(id, true).subscribe({
      next: () => {
        testimonial.approved = true;
        this.testimonials.set([...this.testimonials()]);
        this.toast.success('Témoignage publié.');
      },
      error: () => {
        this.toast.error("Erreur lors de l'approbation.");
      },
    });
  }

  unapprove(testimonial: Testimonial): void {
    const id = this.idOf(testimonial);
    if (!id) return;

    this.testimonialService.setApproved(id, false).subscribe({
      next: () => {
        testimonial.approved = false;
        this.testimonials.set([...this.testimonials()]);
        this.toast.success('Témoignage dépublié.');
      },
      error: () => {
        this.toast.error('Erreur lors de la dépublication.');
      },
    });
  }

  approveAll(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Publier les ${this.pendingCount()} témoignage(s) en attente ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.approvingAll.set(true);
      this.testimonialService.approveAll().subscribe({
        next: () => {
          this.approvingAll.set(false);
          this.testimonials.set(
            this.testimonials().map((t) => ({ ...t, approved: true }))
          );
          this.toast.success('Tous les témoignages ont été publiés.');
        },
        error: () => {
          this.approvingAll.set(false);
          this.toast.error('Erreur lors de la publication groupée.');
        },
      });
    });
  }

  deleteTestimonial(testimonial: Testimonial): void {
    const id = this.idOf(testimonial);
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Êtes-vous sûr de vouloir supprimer le témoignage de "${testimonial.name}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.testimonialService.deleteTestimonial(id).subscribe({
        next: () => {
          this.testimonials.update((list) =>
            list.filter((t) => this.idOf(t) !== id)
          );
          this.toast.success('Témoignage supprimé.');
        },
        error: () => {
          this.toast.error('Erreur lors de la suppression.');
        },
      });
    });
  }
}
