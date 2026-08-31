import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { Program } from '../../../models/programs.models';
import { PdfFile } from '../../../models/pdf.models';
import { RichTextEditorComponent } from '../../../components/rich-text-editor/rich-text-editor.component';
import { EditableImageComponent } from '../../../components/editable-image/editable-image.component';
import { AutoResizeDirective } from '../../../directives/auto-resize.directive';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import {
  LucideDynamicIcon,
  LucideEye,
  LucideEyeOff,
  LucideLaptop,
  LucideMonitor,
  LucidePlus,
  LucideSmartphone,
  LucideTablet,
  LucideTrash2,
  LucideUpload,
  provideLucideIcons,
} from '@lucide/angular';

type PreviewDeviceId = 'mobile' | 'tablet' | 'laptop' | 'desktop';

interface PreviewDevice {
  id: PreviewDeviceId;
  label: string;
  width: number;
  icon: string;
}

const PREVIEW_DEVICES: PreviewDevice[] = [
  { id: 'mobile', label: 'Mobile', width: 375, icon: 'smartphone' },
  { id: 'tablet', label: 'Tablette', width: 768, icon: 'tablet' },
  { id: 'laptop', label: 'Laptop', width: 1280, icon: 'laptop' },
  { id: 'desktop', label: 'Desktop', width: 1440, icon: 'monitor' },
];

function emptyProgram(): Program {
  return {
    _id: '',
    title: '',
    description: '',
    duration: '',
    audience: '',
    prerequisite: '',
    banner: { src: 'default-banner.jpg', alt: '' },
    summary: '',
    content: '',
    details: [],
    methodology: [],
    modules: [],
    images: [],
    pdf: [],
    information: '',
  };
}

@Component({
  selector: 'app-admin-training-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RichTextEditorComponent,
    EditableImageComponent,
    AutoResizeDirective,
    LucideDynamicIcon,
  ],
  providers: [
    provideLucideIcons(
      LucideEye,
      LucideEyeOff,
      LucideLaptop,
      LucideMonitor,
      LucidePlus,
      LucideSmartphone,
      LucideTablet,
      LucideTrash2,
      LucideUpload
    ),
  ],
  templateUrl: './admin-training-form.component.html',
  styleUrl: './admin-training-form.component.scss',
})
export class AdminTrainingFormComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);

  readonly isCreateMode = signal(true);
  readonly saving = signal(false);
  readonly trainingId = signal<string | null>(null);

  program: Program = emptyProgram();

  // Live preview: an iframe loading a bare route (see PreviewFrameComponent)
  // that renders the real public program-detail page, kept in sync with
  // this form's unsaved edits over postMessage. An iframe (rather than
  // embedding the page directly) gives it a real, independent viewport
  // width, so its own mobile/tablet/desktop CSS breakpoints genuinely
  // kick in instead of just showing the desktop layout scaled down.
  readonly previewDevices = PREVIEW_DEVICES;
  readonly previewOpen = signal(false);
  readonly previewDevice = signal<PreviewDeviceId>('laptop');
  readonly previewFrameHeight = signal(600);
  readonly previewPanelWidth = signal(0);
  readonly previewFrameUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(
      '/admin/preview-frame/training'
    );

  private readonly previewIframe =
    viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');
  private readonly previewPanelBody =
    viewChild<ElementRef<HTMLElement>>('previewPanelBody');

  private previewReady = false;
  private previewSyncHandle?: ReturnType<typeof setInterval>;
  private previewResizeObserver?: ResizeObserver;
  private readonly previewOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';

  get previewDeviceWidth(): number {
    return (
      this.previewDevices.find((d) => d.id === this.previewDevice())
        ?.width ?? 1280
    );
  }

  get previewScale(): number {
    const panelWidth = this.previewPanelWidth();
    return panelWidth ? Math.min(1, panelWidth / this.previewDeviceWidth) : 1;
  }

  constructor() {
    // Runs after Angular finishes rendering the effects of previewOpen()
    // changing (the @if block mounting/unmounting the panel) - calling
    // this directly from togglePreview() raced the #previewPanelBody
    // element not existing in the DOM yet, so the observer silently never
    // attached and previewPanelWidth stayed 0 forever (previewScale's
    // fallback), which is why the preview never actually shrank.
    effect(() => {
      if (this.previewOpen()) {
        this.previewReady = false;
        this.observePreviewPanelWidth();
        this.startPreviewSync();
      } else {
        this.stopPreviewSync();
        this.previewResizeObserver?.disconnect();
      }
    });
  }

  readonly pdfs = signal<PdfFile[]>([]);
  selectedPdfFile?: File;

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['program'] as
      | Program
      | undefined;

    if (resolved) {
      this.isCreateMode.set(false);
      this.trainingId.set(resolved._id);
      this.program = { ...resolved };
      this.loadPdfs(resolved._id);
    }
  }

  ngOnDestroy(): void {
    this.stopPreviewSync();
    this.previewResizeObserver?.disconnect();
  }

  togglePreview(): void {
    this.previewOpen.set(!this.previewOpen());
  }

  private observePreviewPanelWidth(): void {
    const el = this.previewPanelBody()?.nativeElement;
    if (!el) {
      if (this.previewOpen()) {
        requestAnimationFrame(() => this.observePreviewPanelWidth());
      }
      return;
    }

    this.previewResizeObserver?.disconnect();
    this.previewResizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (!width) return;
      // ResizeObserver isn't patched into Angular's zone by default (unlike
      // addEventListener) - without this, the signal updates but nothing
      // schedules a re-render, so the template silently keeps stale scale.
      this.ngZone.run(() => this.previewPanelWidth.set(width));
    });
    this.previewResizeObserver.observe(el);
  }

  @HostListener('window:message', ['$event'])
  onPreviewMessage(event: MessageEvent): void {
    if (!this.previewOrigin || event.origin !== this.previewOrigin) return;

    const data = event.data as
      | { type: 'dm-format-preview-ready' }
      | { type: 'dm-format-preview-height'; height: number }
      | undefined;

    if (data?.type === 'dm-format-preview-ready') {
      this.previewReady = true;
      this.postPreviewData();
    } else if (data?.type === 'dm-format-preview-height') {
      this.previewFrameHeight.set(data.height);
    }
  }

  private startPreviewSync(): void {
    this.stopPreviewSync();
    // Polling rather than hooking every individual ngModel change - this
    // form has dozens of separate bindings (title, modules[], details[]...)
    // and `program` is a plain mutated-in-place object, not a signal, so
    // there's no single change event to react to. 400ms is imperceptible
    // for a "live" preview and far simpler than wiring every field.
    this.previewSyncHandle = setInterval(() => this.postPreviewData(), 400);
  }

  private stopPreviewSync(): void {
    if (this.previewSyncHandle) {
      clearInterval(this.previewSyncHandle);
      this.previewSyncHandle = undefined;
    }
  }

  private postPreviewData(): void {
    if (!this.previewReady) return;
    this.previewIframe()?.nativeElement.contentWindow?.postMessage(
      { type: 'dm-format-preview-update', program: this.program },
      this.previewOrigin
    );
  }

  get pageId(): string {
    return this.trainingId() ? `program-${this.trainingId()}` : '';
  }

  addModule(): void {
    this.program.modules = [
      ...this.program.modules,
      { title: '', description: '' },
    ];
  }

  removeModule(index: number): void {
    this.program.modules = this.program.modules.filter((_, i) => i !== index);
  }

  addDetail(): void {
    this.program.details = [...this.program.details, ''];
  }

  removeDetail(index: number): void {
    this.program.details = this.program.details.filter((_, i) => i !== index);
  }

  addMethodology(): void {
    this.program.methodology = [...this.program.methodology, ''];
  }

  removeMethodology(index: number): void {
    this.program.methodology = this.program.methodology.filter(
      (_, i) => i !== index
    );
  }

  onBannerUploaded(event: { url: string; altText: string }): void {
    this.program.banner = { src: event.url, alt: event.altText };
  }

  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPdfFile = input.files[0];
    }
  }

  uploadSelectedPdf(): void {
    if (!this.selectedPdfFile || !this.pageId) return;

    const formData = new FormData();
    formData.append('pdf', this.selectedPdfFile);
    formData.append('title', this.selectedPdfFile.name);

    this.apiService.uploadPagePdf(this.pageId, formData).subscribe({
      next: () => {
        this.toast.success('PDF ajouté avec succès !');
        this.selectedPdfFile = undefined;
        this.loadPdfs(this.trainingId()!);
      },
      error: () => {
        this.toast.error("Erreur lors de l'ajout du PDF.");
      },
    });
  }

  deletePdf(pdf: PdfFile): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Supprimer le PDF "${pdf.title}" ?` },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.apiService.deletePagePdf(pdf.pageId, pdf.publicId).subscribe({
        next: () => {
          this.toast.success('PDF supprimé.');
          this.loadPdfs(this.trainingId()!);
        },
        error: () => {
          this.toast.error('Erreur lors de la suppression du PDF.');
        },
      });
    });
  }

  // A blank `_id: ''` would otherwise reach Mongoose, which fails casting
  // it to an ObjectId - the create request must omit the field entirely.
  private withoutId(program: Program): Partial<Program> {
    const { _id, ...rest } = program;
    return rest;
  }

  private loadPdfs(id: string): void {
    this.apiService.getPagePdfs(`program-${id}`).subscribe({
      next: (res) => {
        this.pdfs.set(
          (res.data || []).filter(
            (pdf: PdfFile) => pdf.pageId === `program-${id}`
          )
        );
      },
      error: () => {
        this.pdfs.set([]);
      },
    });
  }

  save(): void {
    this.saving.set(true);
    const id = this.trainingId();

    const request = id
      ? this.apiService.patchProgramById(id, this.program)
      : this.apiService.createProgram(this.withoutId(this.program));

    request.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.toast.success('Formation enregistrée avec succès !');
        if (!id) {
          // Redirect into edit mode so the banner/PDF (which need a real
          // training id) become available right away, instead of bouncing
          // back to the list.
          this.router.navigate(['/admin/trainings', result._id]);
        }
      },
      error: () => {
        this.saving.set(false);
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }
}
