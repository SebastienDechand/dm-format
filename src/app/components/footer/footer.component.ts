import { Component, viewChild } from '@angular/core';
import { RecaptchaComponent } from '../recaptcha/recaptcha.component';
import { ModalComponent } from '../modal/modal.component';
import { environment } from '../../../environments/environment';
import {
  LucideAngularModule,
  MapPin,
  Globe,
  Lock,
  Phone,
  Mail,
  Scale,
} from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [ModalComponent, RecaptchaComponent, LucideAngularModule],
  providers: [
    LucideAngularModule.pick({ MapPin, Globe, Lock, Phone, Mail, Scale })
      .providers ?? [],
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: true,
})
export class FooterComponent {
  siteKey: string = environment.recaptcha.siteKey;
  currentYear: number = new Date().getFullYear();
  captchaVerified = false;
  showMentionsLegales: boolean = false;

  readonly recaptcha = viewChild.required(RecaptchaComponent);

  executeRecaptcha() {
    this.recaptcha().execute();
  }

  onCaptchaResolved(captchaResponse: string | null): void {
    if (captchaResponse) {
      setTimeout(() => {
        this.captchaVerified = true;
      }, 1000);
    }
  }

  openModal(type: string): void {
    if (type === 'mentionsLegales') {
      this.showMentionsLegales = true;
    }
  }

  closeModal(): void {
    this.showMentionsLegales = false;
  }
}
