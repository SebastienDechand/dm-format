import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  input,
  output,
  inject,
  viewChild,
} from '@angular/core';

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        params: Record<string, unknown>
      ) => number;
      execute: (widgetId: number) => void;
      reset: (widgetId: number) => void;
    };
  }
}

let recaptchaScriptPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve) => {
    if (window.grecaptcha?.render) {
      resolve();
      return;
    }

    const callbackName = '__ngRecaptchaOnLoad';
    (window as any)[callbackName] = () => resolve();

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
}

// Minimal drop-in replacement for ng-recaptcha-2's <re-captcha> (invisible v2),
// so this app doesn't depend on a wrapper library that lags behind Angular majors.
@Component({
  selector: 're-captcha',
  standalone: true,
  template: `<div #container></div>`,
})
export class RecaptchaComponent implements OnInit, OnDestroy {
  private readonly container =
    viewChild.required<ElementRef<HTMLElement>>('container');
  private zone = inject(NgZone);
  private platformId = inject<Object>(PLATFORM_ID);

  readonly siteKey = input.required<string>();
  readonly size = input<'invisible' | 'normal' | 'compact'>('invisible');
  readonly resolved = output<string | null>();

  private widgetId: number | null = null;

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await loadRecaptchaScript();

    this.widgetId = window.grecaptcha!.render(this.container().nativeElement, {
      sitekey: this.siteKey(),
      size: this.size(),
      callback: (token: string) =>
        this.zone.run(() => this.resolved.emit(token)),
      'expired-callback': () => this.zone.run(() => this.resolved.emit(null)),
      'error-callback': () => this.zone.run(() => this.resolved.emit(null)),
    });
  }

  execute(): void {
    if (this.widgetId !== null) {
      window.grecaptcha?.execute(this.widgetId);
    }
  }

  reset(): void {
    if (this.widgetId !== null) {
      window.grecaptcha?.reset(this.widgetId);
    }
  }

  ngOnDestroy(): void {
    this.widgetId = null;
  }
}
