import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 3000) {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['toast-success'],
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }

  error(message: string, duration = 4000) {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['toast-error'],
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }
}
