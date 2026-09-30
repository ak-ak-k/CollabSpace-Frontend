import {
  afterNextRender,
  Component,
  ElementRef,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { createUniqueId } from '../../../ui/input/field/unique-id';

@Component({
  selector: 'app-message-edit-form',
  imports: [ButtonComponent],
  templateUrl: './message-edit-form.component.html',
  styleUrl: './message-edit-form.component.scss',
})
export class MessageEditFormComponent {
  readonly text = input.required<string>();

  readonly saved = output<string>();
  readonly cancelled = output<void>();

  private readonly control = viewChild.required<ElementRef<HTMLTextAreaElement>>('control');

  protected readonly controlId = createUniqueId('edit-box');
  protected readonly draft = linkedSignal(() => this.text());

  constructor() {
    afterNextRender(() => this.focusWithCaretAtEnd());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) {
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.save();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.cancel();
    }
  }

  protected save(): void {
    const next = this.draft().trim();
    if (next === '' || next === this.text().trim()) {
      this.cancel();
      return;
    }
    this.saved.emit(next);
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  private focusWithCaretAtEnd(): void {
    const textarea = this.control().nativeElement;
    const end = textarea.value.length;
    textarea.focus();
    textarea.setSelectionRange(end, end);
  }
}
