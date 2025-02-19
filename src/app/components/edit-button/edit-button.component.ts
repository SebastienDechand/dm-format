import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-edit-button',
  templateUrl: './edit-button.component.html',
  styleUrls: ['./edit-button.component.scss'],
  standalone: true,
})
export class EditButtonComponent {
  @Output() editClicked = new EventEmitter<void>();

  onEditClick() {
    this.editClicked.emit();
  }
}
