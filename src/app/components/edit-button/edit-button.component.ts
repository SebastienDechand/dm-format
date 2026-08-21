import { Component, Input, output } from '@angular/core';
import { LucideDynamicIcon, LucidePen, provideLucideIcons } from '@lucide/angular';

@Component({
  selector: 'app-edit-button',
  templateUrl: './edit-button.component.html',
  styleUrls: ['./edit-button.component.scss'],
  standalone: true,
  imports: [LucideDynamicIcon],
  providers: [provideLucideIcons(LucidePen)],
})
export class EditButtonComponent {
  readonly editClicked = output<void>();

  onEditClick() {
    this.editClicked.emit();
  }
}
