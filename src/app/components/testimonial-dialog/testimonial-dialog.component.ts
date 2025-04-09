import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-testimonial-dialog',
  templateUrl: './testimonial-dialog.component.html',
  styleUrls: ['./testimonial-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
})
export class TestimonialDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
