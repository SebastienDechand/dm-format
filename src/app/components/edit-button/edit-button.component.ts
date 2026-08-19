import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, Pen } from 'lucide-angular';

@Component({
  selector: 'app-edit-button',
  templateUrl: './edit-button.component.html',
  styleUrls: ['./edit-button.component.scss'],
  standalone: true,
  imports: [LucideAngularModule],
  providers: [LucideAngularModule.pick({ Pen }).providers ?? []],
})
export class EditButtonComponent {
  @Output() editClicked = new EventEmitter<void>();

  onEditClick() {
    this.editClicked.emit();
  }
}
