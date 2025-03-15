import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TestimonialService } from '../../services/testimonial.service';
import { Testimonial } from '../../models/testimonials.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment.prod';
import { platform } from 'os';

@Component({
  selector: 'app-training-testimonials',
  templateUrl: './training-testimonials.component.html',
  styleUrls: ['./training-testimonials.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaModule],
})
export class TrainingTestimonialsComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() programId!: string;
  @Input() isAdmin: boolean = false;

  // ReCAPTCHA
  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent;
  siteKey: string = environment.recaptcha.siteKey;
  captchaVerified = false;

  testimonials: Testimonial[] = [];

  // Propriétés du carousel
  carouselThreshold = 5;
  useCarousel = false;
  currentSlide = 0;
  slidesToShow = 5;
  autoplayInterval: any = null;
  autoplayDelay = 5000;
  isAnimating = false;

  testimonialForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  formSubmitted = false;
  successMessage = '';
  errorMessage = '';

  // Variable pour tracker le dernier programId chargé
  private lastLoadedProgramId: string = '';
  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private testimonialService: TestimonialService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initForm();
    this.loadTestimonials();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['programId'] && !changes['programId'].firstChange) {
      const newProgramId = changes['programId'].currentValue;
      const previousProgramId = changes['programId'].previousValue;

      if (newProgramId !== previousProgramId) {
        this.captchaVerified = false;
        this.loadTestimonials();
        this.resetCarousel();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Configurer l'affichage initial du carousel
      this.updateCarouselConfig();
    }
  }

  // Détecter les changements de taille d'écran
  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      this.updateCarouselConfig();
    }
  }

  updateCarouselConfig() {
    if (!this.isBrowser) {
      return; // Ne pas exécuter côté serveur
    }

    // Adapter le nombre de témoignages à afficher selon la largeur d'écran
    const width = window.innerWidth;

    if (width < 576) {
      this.slidesToShow = 1;
    } else if (width < 992) {
      this.slidesToShow = 3;
    } else {
      this.slidesToShow = 5;
    }

    // Vérifier si le carousel doit être activé
    this.useCarousel = this.testimonials.length > this.carouselThreshold;
  }

  initForm(): void {
    this.testimonialForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required]],
      feedback: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  loadTestimonials(): void {
    if (!this.programId) {
      return;
    }

    if (this.lastLoadedProgramId === this.programId) {
      return;
    }

    this.isLoading = true;
    this.lastLoadedProgramId = this.programId;

    this.testimonials = [];

    this.testimonialService.getTestimonialsByTraining(this.programId).subscribe(
      (response) => {
        if (response && response.data) {
          this.testimonials = response.data;

          // Mettre à jour le carousel après le chargement des témoignages
          setTimeout(() => {
            this.updateCarouselConfig();
            this.setupAutoplay();
          });
        } else {
          console.warn('Format de réponse inattendu:', response);
          this.testimonials = [];
        }
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

  // Méthodes du carousel
  nextSlide(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    const maxSlide =
      Math.ceil(this.testimonials.length / this.slidesToShow) - 1;
    this.currentSlide =
      this.currentSlide + 1 > maxSlide ? 0 : this.currentSlide + 1;

    setTimeout(() => {
      this.isAnimating = false;
    }, 500); // Correspondre à la durée de transition CSS
  }

  prevSlide(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    const maxSlide =
      Math.ceil(this.testimonials.length / this.slidesToShow) - 1;
    this.currentSlide =
      this.currentSlide - 1 < 0 ? maxSlide : this.currentSlide - 1;

    setTimeout(() => {
      this.isAnimating = false;
    }, 500); // Correspondre à la durée de transition CSS
  }

  goToSlide(index: number): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.currentSlide = index;

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  setupAutoplay(): void {
    if (!this.isBrowser) {
      return; // Ne pas exécuter côté serveur
    }

    // Nettoyer tout intervalle existant
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }

    // Configurer l'autoplay seulement si le carousel est activé
    if (this.useCarousel) {
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoplayDelay);
    }
  }

  pauseAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  resumeAutoplay(): void {
    this.setupAutoplay();
  }

  resetCarousel(): void {
    this.currentSlide = 0;
    this.pauseAutoplay();
    this.setupAutoplay();
  }

  // Calculer la transformation pour le carousel
  getCarouselTransform(): string {
    const slideWidth = 100 / this.slidesToShow;
    const translateX = -this.currentSlide * slideWidth * this.slidesToShow;
    return `translateX(${translateX}%)`;
  }

  // Obtenir le nombre total de pages du carousel
  getTotalPages(): number {
    return Math.ceil(this.testimonials.length / this.slidesToShow);
  }

  // Vérifier si une page est active
  isActivePage(index: number): boolean {
    return this.currentSlide === index;
  }

  // reCAPTCHA
  executeRecaptcha() {
    this.recaptcha.execute();
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
    this.errorMessage = '';
    this.successMessage = '';

    const testimonial: Testimonial = {
      ...this.testimonialForm.value,
      trainingId: this.programId,
    };

    this.testimonialService.addTestimonial(testimonial).subscribe(
      (response) => {
        if (response && response.data) {
          const newTestimonial = response.data;
          this.testimonials.unshift(newTestimonial);

          // Mettre à jour le carousel avec le nouveau témoignage
          this.updateCarouselConfig();
          this.resetCarousel();
        }
        this.testimonialForm.reset();
        this.formSubmitted = false;
        this.isSubmitting = false;
        this.successMessage = 'Votre témoignage a été ajouté avec succès !';
        this.captchaVerified = false;
        setTimeout(() => (this.successMessage = ''), 5000);
      },
      (error) => {
        console.error("Erreur lors de l'ajout du témoignage:", error);
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message ||
          "Une erreur est survenue lors de l'ajout du témoignage";
        setTimeout(() => (this.errorMessage = ''), 5000);
      }
    );
  }

  deleteTestimonial(testimonialId: any, index: number): void {
    if (
      !this.isAdmin ||
      !confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')
    ) {
      return;
    }

    const id =
      typeof testimonialId === 'object' && testimonialId.$oid
        ? testimonialId.$oid
        : testimonialId;

    this.testimonialService.deleteTestimonial(id).subscribe(
      () => {
        this.testimonials.splice(index, 1);
        this.successMessage = 'Témoignage supprimé avec succès';

        // Mettre à jour le carousel après la suppression
        this.updateCarouselConfig();
        this.resetCarousel();

        setTimeout(() => (this.successMessage = ''), 5000);
      },
      (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.errorMessage =
          error.error?.message || 'Erreur lors de la suppression du témoignage';
        setTimeout(() => (this.errorMessage = ''), 5000);
      }
    );
  }

  get f() {
    return this.testimonialForm.controls;
  }
}
