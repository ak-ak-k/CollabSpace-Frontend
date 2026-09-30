import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';

const EDGE_TOLERANCE_PX = 1;

@Directive({
  selector: '[appScrollEdges]',
  exportAs: 'appScrollEdges',
  host: {
    '(scroll)': 'measure()',
  },
})
export class ScrollEdgesDirective {
  private readonly viewport = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  readonly hiddenAtStart = signal(false);
  readonly hiddenAtEnd = signal(false);

  constructor() {
    afterNextRender(() => {
      this.observeResizes();
      this.measure();
    });
  }

  measure(): void {
    const { scrollLeft, scrollWidth, clientWidth } = this.viewport;
    const scrolledDistance = Math.abs(scrollLeft);
    const remainingDistance = scrollWidth - clientWidth - scrolledDistance;

    this.hiddenAtStart.set(scrolledDistance > EDGE_TOLERANCE_PX);
    this.hiddenAtEnd.set(remainingDistance > EDGE_TOLERANCE_PX);
  }

  private observeResizes(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => this.measure());
    observer.observe(this.viewport);
    Array.from(this.viewport.children).forEach((child) => observer.observe(child));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
