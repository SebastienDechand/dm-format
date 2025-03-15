import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment.prod';
import { Testimonial } from '../../models/testimonials.model';
import { TestimonialService } from '../../services/testimonial.service';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';

@Component({
  selector: 'app-training-testimonials',
  templateUrl: './training-testimonials.component.html',
  styleUrls: ['./training-testimonials.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecaptchaModule,
    SlickCarouselModule,
  ],
})
export class TrainingTestimonialsComponent implements OnInit, OnChanges {
  @Input() programId!: string;
  @Input() isAdmin: boolean = false;

  // Carousel
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // ReCAPTCHA
  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent;
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

  constructor(
    private fb: FormBuilder,
    private testimonialService: TestimonialService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  // reCAPTCHA
  executeRecaptcha() {
    if (isPlatformBrowser(this.platformId) && this.recaptcha) {
      this.recaptcha.execute();
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
