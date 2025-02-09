import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-certification',
  imports: [CommonModule],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss',
  standalone: true,
})
export class CertificationComponent {
  @Input() certificationData: any;
}
