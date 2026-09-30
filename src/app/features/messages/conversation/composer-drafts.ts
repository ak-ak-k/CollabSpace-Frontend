import { signal } from '@angular/core';
import { Attachment } from '../../../core/models/message';

export class ComposerDrafts {
  private readonly texts = signal<Readonly<Record<string, string>>>({});
  private readonly files = signal<Readonly<Record<string, readonly Attachment[]>>>({});

  text(conversationId: string): string {
    return this.texts()[conversationId] ?? '';
  }

  attachments(conversationId: string): readonly Attachment[] {
    return this.files()[conversationId] ?? [];
  }

  setText(conversationId: string, text: string): void {
    this.texts.update((texts) => ({ ...texts, [conversationId]: text }));
  }

  setAttachments(conversationId: string, attachments: readonly Attachment[]): void {
    this.files.update((files) => ({ ...files, [conversationId]: attachments }));
  }

  clear(conversationId: string): void {
    this.setText(conversationId, '');
    this.setAttachments(conversationId, []);
  }
}
