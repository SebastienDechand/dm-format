import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnChanges,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  input,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RecaptchaComponent } from '../recaptcha/recaptcha.component';
import { environment } from '../../../environments/environment';
import { Testimonial } from '../../models/testimonials.model';
import { TestimonialService } from '../../services/testimonial.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TestimonialDialogComponent } from '../testimonial-dialog/testimonial-dialog.component';
import {
  LucideDynamicIcon,
  LucideTrash2,
  LucideShieldCheck,
  LucideShield,
  LucideChevronLeft,
  LucideChevronRight,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-training-testimonials',
  templateUrl: './training-testimonials.component.html',
  styleUrls: ['./training-testimonials.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecaptchaComponent,
    LucideDynamicIcon,
  ],
  providers: [
    provideLucideIcons(
      LucideTrash2,
      LucideShieldCheck,
      LucideShield,
      LucideChevronLeft,
      LucideChevronRight
    ),
  ],
})
export class TrainingTestimonialsComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private testimonialService = inject(TestimonialService);
  private platformId = inject<Object>(PLATFORM_ID);

  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  readonly programId = input.required<string>();
  readonly isAdmin = input<boolean>(false);

  // Carousel "vitrine" : deux témoignages affichés en grand à la fois
  // (un seul sur mobile), avec un aperçu défilant des autres en
  // dessous pour y accéder directement plutôt qu'un point par témoignage.
  visibleSlides = 2;
  currentIndex = 0;

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateVisibleSlides();
  }

  private updateVisibleSlides(): void {
    this.visibleSlides = window.innerWidth <= 768 ? 1 : 2;
    this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
  }

  // Regroupées en pages plutôt qu'un flux plat avec un gap uniforme :
  // le décalage translateX(-100%) par page reste exact quel que soit
  // le nombre de témoignages, sans dérive cumulée sur les pages tardives.
  get pages(): Testimonial[][] {
    const chunks: Testimonial[][] = [];
    for (let i = 0; i < this.testimonials.length; i += this.visibleSlides) {
      chunks.push(this.testimonials.slice(i, i + this.visibleSlides));
    }
    return chunks;
  }

  get maxIndex(): number {
    return Math.max(0, this.pages.length - 1);
  }

  get trackTransform(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  prevSlide(): void {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.scrollPreviewIntoView();
  }

  nextSlide(): void {
    this.currentIndex = Math.min(this.maxIndex, this.currentIndex + 1);
    this.scrollPreviewIntoView();
  }

  goToTestimonial(index: number): void {
    this.currentIndex = Math.min(
      this.maxIndex,
      Math.floor(index / this.visibleSlides)
    );
    this.scrollPreviewIntoView();
  }

  isActivePreview(index: number): boolean {
    return Math.floor(index / this.visibleSlides) === this.currentIndex;
  }

  // Fait défiler l'aperçu du bas pour garder la vignette active visible,
  // que le changement vienne des flèches ou d'un clic sur une vignette.
  readonly previewStrip = viewChild<ElementRef<HTMLElement>>('previewStrip');

  private scrollPreviewIntoView(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const container = this.previewStrip()?.nativeElement;
      const active = container?.querySelector(
        '.preview-item.active'
      ) as HTMLElement | null;
      active?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    });
  }

  scrollPreviewBy(direction: 1 | -1): void {
    const container = this.previewStrip()?.nativeElement;
    if (!container) return;
    container.scrollBy({ left: direction * 220, behavior: 'smooth' });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  }

  // ReCAPTCHA
  readonly recaptcha = viewChild.required(RecaptchaComponent);
  siteKey: string = environment.recaptcha.siteKey;
  captchaVerified = false;

  testimonials: Testimonial[] = [];

  testimonialForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  formSubmitted = false;
  successMessage = '';
  errorMessage = '';

  // Variable pour tracker le dernier programId chargé
  private lastLoadedProgramId: string = '';

  ngOnInit(): void {
    this.initForm();
    this.loadTestimonials();
    if (isPlatformBrowser(this.platformId)) {
      this.updateVisibleSlides();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['programId'] && !changes['programId'].firstChange) {
      const newProgramId = changes['programId'].currentValue;
      const previousProgramId = changes['programId'].previousValue;

      if (newProgramId !== previousProgramId) {
        this.captchaVerified = false;
        this.loadTestimonials();
      }
    }
  }

  initForm(): void {
    this.testimonialForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required]],
      feedback: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  loadTestimonials(): void {
    const programId = this.programId();
    if (!programId) {
      return;
    }

    if (this.lastLoadedProgramId === programId) {
      return;
    }

    this.isLoading = true;
    this.lastLoadedProgramId = programId;

    this.testimonials = [];

    this.testimonialService.getTestimonialsByTraining(programId).subscribe(
      (response) => {
        if (response && response.data) {
          this.testimonials = response.data;
        } else {
          console.warn('Format de réponse inattendu:', response);
          this.testimonials = [];
        }
        this.currentIndex = 0;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des témoignages', error);
        this.isLoading = false;
        this.errorMessage =
          'Impossible de charger les témoignages pour le moment.';
        setTimeout(() => (this.errorMessage = ''), 5000);
      }
    );
  }

  // reCAPTCHA
  executeRecaptcha() {
    const recaptcha = this.recaptcha();
    if (isPlatformBrowser(this.platformId) && recaptcha) {
      recaptcha.execute();
    }
  }

  onCaptchaResolved(captchaResponse: string | null): void {
    if (captchaResponse) {
      this.captchaVerified = true;
      if (this.formSubmitted) {
        this.processFormSubmission();
      }
    } else {
      this.errorMessage =
        'La vérification du CAPTCHA a échoué. Veuillez réessayer.';
      setTimeout(() => (this.errorMessage = ''), 5000);
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.testimonialForm.invalid) {
      return;
    }

    if (!this.captchaVerified) {
      this.executeRecaptcha();
      return;
    }

    this.processFormSubmission();
  }

  private processFormSubmission(): void {
    this.isSubmitting = true;

    const testimonial: Testimonial = {
      ...this.testimonialForm.value,
      trainingId: this.programId(),
    };

    this.testimonialService.addTestimonial(testimonial).subscribe({
      next: (response) => {
        if (response?.data) {
          this.testimonials.unshift(response.data);
        }

        this.testimonialForm.reset();
        this.formSubmitted = false;
        this.isSubmitting = false;
        this.captchaVerified = false;

        this.toast.success('Votre témoignage a été ajouté avec succès !');
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout du témoignage:", error);
        this.isSubmitting = false;
        this.toast.error(
          error.error?.message ||
            "Une erreur est survenue lors de l'ajout du témoignage"
        );
      },
    });
  }

  deleteTestimonial(testimonialId: any, index: number): void {
    if (!this.isAdmin()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûr de vouloir supprimer ce témoignage ?' },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      const id =
        typeof testimonialId === 'object' && testimonialId.$oid
          ? testimonialId.$oid
          : testimonialId;

      this.testimonialService.deleteTestimonial(id).subscribe({
        next: () => {
          this.testimonials.splice(index, 1);
          this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
          this.toast.success('Témoignage supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toast.error(
            error.error?.message ||
              'Erreur lors de la suppression du témoignage'
          );
        },
      });
    });
  }

  get f() {
    return this.testimonialForm.controls;
  }

  openTestimonialDialog(testimonial: Testimonial): void {
    this.dialog.open(TestimonialDialogComponent, {
      data: testimonial,
    });
  }
}
