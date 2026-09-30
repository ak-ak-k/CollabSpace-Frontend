import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'textarea[appTextareaAutoGrow]',
  host: { '(input)': 'fit()' },
})
export class TextareaAutoGrowDirective {
  private readonly element = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private observedWidth = 0;
  private pendingFrame = 0;

  constructor() {
    afterNextRender(() => this.refitOnWidthChange());
  }

  fit(): void {
    const textarea = this.element.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  private refitOnWidthChange(): void {
    const observer = new ResizeObserver((entries) => this.onResize(entries));
    observer.observe(this.element.nativeElement);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      cancelAnimationFrame(this.pendingFrame);
    });
  }

  private onResize(entries: readonly ResizeObserverEntry[]): void {
    const width = entries[entries.length - 1].contentRect.width;
    if (width === this.observedWidth) {
      return;
    }
    this.observedWidth = width;
    cancelAnimationFrame(this.pendingFrame);
    this.pendingFrame = requestAnimationFrame(() => this.fit());
  }
}
