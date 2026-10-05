import { DOCUMENT, inject } from '@angular/core';
import { Attachment } from '../../../core/models/message';
import { attachmentFromFile } from './attachment-chips/attachment-chips.component';

export class ComposerFiles {
  private readonly urls = inject(DOCUMENT).defaultView?.URL;

  takeFrom(input: HTMLInputElement): Attachment[] {
    const chosen = Array.from(input.files ?? []).map((file) =>
      attachmentFromFile(file, (image) => this.previewUrlOf(image)),
    );
    input.value = '';
    return chosen;
  }

  release(attachment: Attachment | undefined): void {
    if (attachment?.src) {
      this.urls?.revokeObjectURL(attachment.src);
    }
  }

  private previewUrlOf(file: File): string | null {
    try {
      return this.urls?.createObjectURL(file) ?? null;
    } catch {
      return null;
    }
  }
}
