import { Component, OnInit, input, output, inject } from '@angular/core';
import { Program } from '../../models/programs.models';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  LucideDynamicIcon,
  LucideArrowRight,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-programs',
  imports: [RouterLink, MatCardModule, MatButtonModule, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideArrowRight)],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss',
  standalone: true,
})
export class ProgramsComponent implements OnInit {
  private apiService = inject(ApiService);

  readonly editMode = input<boolean>(false);
  readonly editClicked = output<void>();

  trainings: Program[] = [];

  ngOnInit() {
    this.apiService.getPrograms().subscribe((data) => {
      this.trainings = data;
    });
  }

  stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  trackByIndex(index: number, _item: unknown): number {
    return index;
  }

  toggleEditMode() {
    this.editClicked.emit();
  }
}
