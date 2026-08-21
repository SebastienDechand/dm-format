import { Component, Input, output } from '@angular/core';
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
  readonly editClicked = output<void>();

  onEditClick() {
    this.editClicked.emit();
  }
}
