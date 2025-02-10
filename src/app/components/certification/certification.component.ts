import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-certification',
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './certification.component.html',
  styleUrl: './certification.component.scss',
  standalone: true,
})
export class CertificationComponent {
  @Input() certificationData: any;
}
