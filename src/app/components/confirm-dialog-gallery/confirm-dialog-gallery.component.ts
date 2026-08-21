import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog-gallery',
  standalone: true,
  templateUrl: './confirm-dialog-gallery.component.html',
  styleUrls: ['./confirm-dialog-gallery.component.scss'],
})
export class ConfirmDialogGalleryComponent {
  readonly title = input<string>('Confirmer');
  readonly message = input<string>('Êtes-vous sûr(e) de vouloir continuer ?');
  readonly confirmed = output<void>();
  readonly canceled = output<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.canceled.emit();
  }
}
