import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LucideDynamicIcon, LucideX, provideLucideIcons } from '@lucide/angular';

@Component({
  selector: 'app-testimonial-dialog',
  templateUrl: './testimonial-dialog.component.html',
  styleUrls: ['./testimonial-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideX)],
})
export class TestimonialDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
