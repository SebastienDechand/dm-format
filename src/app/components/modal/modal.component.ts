import { Component, input, output } from '@angular/core';

import { LucideDynamicIcon, LucideX, provideLucideIcons } from '@lucide/angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideDynamicIcon],
  providers: [provideLucideIcons(LucideX)],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  readonly title = input<string>('Titre de la modale');
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  closeModal(): void {
    this.close.emit();
  }
}
