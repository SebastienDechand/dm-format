import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-testimonial-dialog',
  templateUrl: './testimonial-dialog.component.html',
  styleUrls: ['./testimonial-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, LucideAngularModule],
  providers: [LucideAngularModule.pick({ X }).providers ?? []],
})
export class TestimonialDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
