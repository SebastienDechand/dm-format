import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog-gallery',
  standalone: true,
  templateUrl: './confirm-dialog-gallery.component.html',
  styleUrls: ['./confirm-dialog-gallery.component.scss'],
})
export class ConfirmDialogGalleryComponent {
  @Input() title: string = 'Confirmer';
  @Input() message: string = 'Êtes-vous sûr(e) de vouloir continuer ?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.canceled.emit();
  }
}
