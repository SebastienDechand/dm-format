import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha-2';
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
  imports: [ModalComponent, CommonModule, RecaptchaModule, LucideAngularModule],
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

  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent;

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

  openModal(type: string): void {
    if (type === 'mentionsLegales') {
      this.showMentionsLegales = true;
    }
  }

  closeModal(): void {
    this.showMentionsLegales = false;
  }
}
