import { Directive, ElementRef, inject, output, signal } from '@angular/core';

const DRAGGED_FILES = 'Files';

@Directive({
  selector: '[appFilesDropZone]',
  host: {
    '(dragover)': 'dragOver($event)',
    '(dragleave)': 'dragLeave($event)',
    '(drop)': 'drop($event)',
  },
})
export class FilesDropZoneDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly filesDropped = output<readonly File[]>();
  readonly dragging = signal(false);

  protected dragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes(DRAGGED_FILES)) {
      return;
    }
    event.preventDefault();
    this.dragging.set(true);
  }

  protected dragLeave(event: DragEvent): void {
    const target = event.relatedTarget;
    if (!(target instanceof Node && this.host.nativeElement.contains(target))) {
      this.dragging.set(false);
    }
  }

  protected drop(event: DragEvent): void {
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.dragging.set(false);
    if (files.length === 0) {
      return;
    }
    event.preventDefault();
    this.filesDropped.emit(files);
  }
}
