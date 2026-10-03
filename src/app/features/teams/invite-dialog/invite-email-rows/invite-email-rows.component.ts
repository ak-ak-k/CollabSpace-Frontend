import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createUniqueId } from '../../../../shared/ui/input/field/unique-id';
import { RowMessage } from '../email-checks';
import {
  EmailRow,
  MAX_EMAIL_ROWS,
  pastedRowEdit,
  RowsEdit,
  typedRowEdit,
  withNewRow,
  withoutEmptyRow,
  withoutRow,
} from '../email-rows';

export interface EmailRowView {
  readonly id: number;
  readonly value: string;
  readonly message: RowMessage | null;
}

@Component({
  selector: 'app-invite-email-rows',
  imports: [ButtonComponent, IconButtonComponent, IconComponent],
  templateUrl: './invite-email-rows.component.html',
  styleUrl: './invite-email-rows.component.scss',
})
export class InviteEmailRowsComponent {
  private readonly injector = inject(Injector);
  private readonly fields = viewChildren<ElementRef<HTMLInputElement>>('emailField');

  readonly rows = model.required<readonly EmailRow[]>();
  readonly views = input.required<readonly EmailRowView[]>();
  readonly countLabel = input('');
  readonly policy = input('');

  protected readonly labelId = createUniqueId('invite-emails');
  protected readonly atLimit = computed(() => this.rows().length >= MAX_EMAIL_ROWS);
  protected readonly removable = computed(() => this.rows().length > 1);

  focusRow(id: number | null): void {
    if (id === null) {
      return;
    }
    afterNextRender({ write: () => this.fieldFor(id)?.focus() }, { injector: this.injector });
  }

  protected messageId(row: EmailRowView): string {
    return `${this.labelId}-message-${row.id}`;
  }

  protected removeLabel(row: EmailRowView, position: number): string {
    return `Remove ${row.value.trim() || `empty address ${position}`}`;
  }

  protected onInput(row: EmailRowView, event: Event): void {
    const field = event.target as HTMLInputElement;
    const edit = typedRowEdit(this.rows(), row.id, field.value);
    const kept = edit.rows.find((candidate) => candidate.id === row.id)?.value ?? '';
    if (field.value !== kept) {
      field.value = kept;
    }
    this.apply(edit);
  }

  protected onPaste(row: EmailRowView, event: ClipboardEvent): void {
    const edit = pastedRowEdit(this.rows(), row.id, event.clipboardData?.getData('text') ?? '');
    if (edit) {
      event.preventDefault();
      this.apply(edit);
    }
  }

  protected onKeydown(row: EmailRowView, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && row.value === '' && this.removable()) {
      event.preventDefault();
      this.apply(withoutEmptyRow(this.rows(), row.id));
    }
  }

  protected remove(row: EmailRowView): void {
    this.apply(withoutRow(this.rows(), row.id));
  }

  protected add(): void {
    this.apply(withNewRow(this.rows()));
  }

  private apply(edit: RowsEdit): void {
    this.rows.set(edit.rows);
    this.focusRow(edit.focusId);
  }

  private fieldFor(id: number): HTMLInputElement | undefined {
    return this.fields()
      .map((field) => field.nativeElement)
      .find((field) => field.dataset['rowId'] === String(id));
  }
}
