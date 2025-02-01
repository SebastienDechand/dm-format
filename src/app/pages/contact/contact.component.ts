import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  imports: [FormsModule, CommonModule, MatSnackBarModule],
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  constructor(private snackBar: MatSnackBar) {}

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

      this.contactData = { name: '', email: '', phone: '', message: '' };
    }
  }
}
