import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SeoService } from '../../services/seo.service';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  imports: [FormsModule, CommonModule, MatSnackBarModule, RecaptchaModule],
})
export class ContactComponent implements OnInit {
  private seoService: SeoService = inject(SeoService);
  siteKey: string = environment.recaptcha.siteKey;
  captchaVerified = false;

  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent;

  contactData = {
    company: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  constructor(private snackBar: MatSnackBar) {}

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
        'Contactez DM-Format pour vos besoins en formation SST et formateur SST. Notre équipe est à votre écoute pour toutes vos questions concernant nos formations de secourisme en entreprise.',
      url: 'https://dm-format.fr/contact',
      keywords:
        'contact, formation SST, devis formation secourisme, demande information formation, contact formateur SST',
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
      this.contactData.name &&
      this.contactData.email &&
      this.contactData.message
    ) {
      console.log('Formulaire soumis :', this.contactData);

      this.snackBar.open('Votre message a bien été envoyé !', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar'],
      });

      this.contactData = {
        company: '',
        name: '',
        email: '',
        phone: '',
        message: '',
      };
    }
  }
}
