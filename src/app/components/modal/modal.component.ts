import { Component, input, output } from '@angular/core';

import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideAngularModule],
  providers: [LucideAngularModule.pick({ X }).providers ?? []],
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
