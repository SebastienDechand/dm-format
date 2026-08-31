import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AutoResizeDirective } from '../../../directives/auto-resize.directive';
import { EditableImageComponent } from '../../../components/editable-image/editable-image.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { About } from '../../../models/about.models';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideTrash2,
  provideLucideIcons,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-about-form',
  standalone: true,
  imports: [
    FormsModule,
    AutoResizeDirective,
    EditableImageComponent,
    LucideDynamicIcon,
  ],
  providers: [provideLucideIcons(LucidePlus, LucideTrash2)],
  templateUrl: './admin-about-form.component.html',
  styleUrl: './admin-about-form.component.scss',
})
export class AdminAboutFormComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  about!: About;
  saving = false;

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['aboutData'] as About;
    this.about = JSON.parse(JSON.stringify(resolved));
  }

  onWhoWeAreImageUploaded(event: { url: string; altText: string }): void {
    this.about.who_we_are.image = { src: event.url, alt: event.altText };
  }

  addContentParagraph(): void {
    this.about.who_we_are.content = [...this.about.who_we_are.content, ''];
  }

  removeContentParagraph(index: number): void {
    this.about.who_we_are.content = this.about.who_we_are.content.filter(
      (_, i) => i !== index
    );
  }

  addStep(): void {
    this.about.concept.steps = [
      ...this.about.concept.steps,
      { icon: '', title: '', description: '' },
    ];
  }

  removeStep(index: number): void {
    this.about.concept.steps = this.about.concept.steps.filter(
      (_, i) => i !== index
    );
  }

  addTrainingItem(): void {
    this.about.trainings.list = [...this.about.trainings.list, ''];
  }

  removeTrainingItem(index: number): void {
    this.about.trainings.list = this.about.trainings.list.filter(
      (_, i) => i !== index
    );
  }

  addPreventionPoint(): void {
    this.about.prevention.points = [
      ...this.about.prevention.points,
      { icon: '', title: '', description: '' },
    ];
  }

  removePreventionPoint(index: number): void {
    this.about.prevention.points = this.about.prevention.points.filter(
      (_, i) => i !== index
    );
  }

  save(): void {
    this.saving = true;
    this.apiService.patchAbout(this.about).subscribe({
      next: (data) => {
        this.saving = false;
        this.about = data;
        this.toast.success('Page À propos enregistrée avec succès !');
      },
      error: () => {
        this.saving = false;
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }
}
