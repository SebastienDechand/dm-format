import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { Program } from '../../../models/programs.models';
import { ProgramDetailComponent } from '../../program-detail/program-detail.component';

interface PreviewUpdateMessage {
  type: 'dm-format-preview-update';
  program: Program;
}

// Bare page, loaded only inside an iframe from an admin form (see
// admin-training-form's device preview panel). It renders nothing on its
// own - the parent window pushes the form's live unsaved data over
// postMessage, so the iframe's own CSS media queries evaluate against its
// real (device-width) viewport instead of a div squeezed/scaled to size,
// giving a genuine mobile/tablet layout instead of a shrunk desktop one.
@Component({
  selector: 'app-preview-frame',
  standalone: true,
  imports: [ProgramDetailComponent],
  template: `
    @if (program(); as program) {
      <app-program-detail
        [previewMode]="true"
        [previewProgram]="program"
      ></app-program-detail>
    }
  `,
})
export class PreviewFrameComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly program = signal<Program | undefined>(undefined);

  private readonly onMessage = (event: MessageEvent): void => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as PreviewUpdateMessage | undefined;
    if (data?.type === 'dm-format-preview-update') {
      this.program.set(data.program);
    }
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    window.addEventListener('message', this.onMessage);
    // Tells the parent it can start posting updates - without this, a
    // message sent before this listener is attached would be lost.
    window.parent.postMessage(
      { type: 'dm-format-preview-ready' },
      window.location.origin
    );
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.removeEventListener('message', this.onMessage);
  }
}
