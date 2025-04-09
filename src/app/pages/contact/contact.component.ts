import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment.prod';
import { SeoService } from '../../services/seo.service';
import { ToastService } from '../../services/toast.service';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  imports: [FormsModule, CommonModule, RecaptchaModule],
})
export class ContactComponent implements OnInit {
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  siteKey: string = environment.recaptcha.siteKey;
  captchaVerified = false;
  isSubmitting = false;

  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent;

  contactData = {
    company: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  constructor() {
    emailjs.init(environment.emailjs.userId);
  }

  ngOnInit() {
    this.updateSeo();
  }

  executeRecaptcha() {
    this.recaptcha.execute();
  }

  onCaptchaResolved(captchaResponse: string | null): void {
    if (captchaResponse) {
      setTimeout(() => {
        this.captchaVerified = true;
      }, 1000);
    }
  }

  private updateSeo(): void {
    this.seoService.updateMetadata({
      title: 'Contact | DM-Format',
      description:
        'Contactez DM-Format pour vos besoins en formation SST et formateur SST...',
      url: 'https://dm-format.fr/contact',
      keywords:
        'contact, formation SST, devis formation secourisme, formateur SST',
    });

    this.seoService.setSchemaMarkup([
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact DM-Format',
        description:
          'Contactez-nous pour toutes vos questions concernant nos formations SST',
        publisher: {
          '@type': 'Organization',
          name: 'DM-Format',
          url: 'https://dm-format.fr',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: 'https://dm-format.fr',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Contact',
            item: 'https://dm-format.fr/contact',
          },
        ],
      },
    ]);
  }

  onSubmit() {
    if (
      !this.contactData.name ||
      !this.contactData.email ||
      !this.contactData.message ||
      this.isSubmitting
    ) {
      return;
    }

    this.isSubmitting = true;

    const templateParams = {
      company: this.contactData.company,
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone || 'Non renseigné',
      message: this.contactData.message,
      time: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      to_email: 'dm.formatsst@gmail.com',
    };

    emailjs
      .send(
        environment.emailjs.serviceId,
        environment.emailjs.templateId,
        templateParams
      )
      .then(
        () => {
          this.toast.success('Votre message a bien été envoyé !');

          this.contactData = {
            company: '',
            name: '',
            email: '',
            phone: '',
            message: '',
          };
        },
        (error) => {
          console.error("Erreur lors de l'envoi de l'email:", error);
          this.toast.error(
            "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer plus tard."
          );
        }
      )
      .finally(() => {
        this.isSubmitting = false;
      });
  }
}
