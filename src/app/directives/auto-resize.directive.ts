import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[autoResize]',
  standalone: true,
})
export class AutoResizeDirective {
  constructor(private elementRef: ElementRef<HTMLTextAreaElement>) {}

  @HostListener('input')
  onInput(): void {
    this.resize();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resize(), 0);
  }

  private resize(): void {
    const textarea = this.elementRef.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.style.overflow = 'hidden';
    console.log('Resized textarea to:', textarea.scrollHeight);
  }
}
