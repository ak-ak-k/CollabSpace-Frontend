import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { joinIds } from '../../../shared/ui/input/field/unique-id';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FieldErrorComponent } from '../../../shared/ui/input/field-error/field-error.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { fileNameError, renamedFileName, splitFileName } from '../file-name';

export interface FileRenameData {
  readonly name: string;
}

@Component({
  selector: 'app-file-rename-dialog',
  imports: [ButtonComponent, FieldErrorComponent, ModalComponent],
  templateUrl: './file-rename-dialog.component.html',
  styleUrl: './file-rename-dialog.component.scss',
})
export class FileRenameDialogComponent {
  private readonly dialogRef = inject<DialogRef<string>>(DialogRef);
  private readonly parts = splitFileName(inject<FileRenameData>(DIALOG_DATA).name);
  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly formId = createOverlayId('file-rename-form');
  protected readonly inputId = `${this.formId}-input`;
  protected readonly extensionId = `${this.formId}-extension`;
  protected readonly errorId = `${this.formId}-error`;
  protected readonly extension = this.parts.extension;
  protected readonly base = signal(this.parts.base);
  protected readonly tried = signal(false);
  protected readonly error = computed(() => fileNameError(this.base()));
  protected readonly showError = computed(() => this.tried() && this.error() !== '');
  protected readonly describedBy = computed(() =>
    joinIds(this.extension ? this.extensionId : null, this.showError() ? this.errorId : null),
  );

  constructor() {
    afterNextRender(() => {
      const input = this.control().nativeElement;
      input.focus();
      input.select();
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.error()) {
      this.tried.set(true);
      this.control().nativeElement.focus();
      return;
    }
    this.dialogRef.close(renamedFileName(this.base(), this.extension));
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
