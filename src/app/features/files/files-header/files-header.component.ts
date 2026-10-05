import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { OFFLINE_UPLOAD_MESSAGE } from '../files-options';

const DROP_HINT = 'or drop files anywhere here';

@Component({
  selector: 'app-files-header',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './files-header.component.html',
  styleUrl: './files-header.component.scss',
})
export class FilesHeaderComponent {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly offline = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly picked = output<readonly File[]>();

  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');
  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');

  protected readonly hintId = createOverlayId('files-upload-hint');
  protected readonly hint = computed(() => {
    if (this.offline()) {
      return OFFLINE_UPLOAD_MESSAGE;
    }
    return this.compact() ? '' : DROP_HINT;
  });

  pick(): void {
    this.picker().nativeElement.click();
  }

  focusHeading(): void {
    this.title().nativeElement.focus();
  }

  protected emitPicked(): void {
    const input = this.picker().nativeElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.picked.emit(files);
  }
}
