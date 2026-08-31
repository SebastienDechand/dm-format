import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss',
})
export class PartnerComponent {
  @Input() partnerData: any;
}
