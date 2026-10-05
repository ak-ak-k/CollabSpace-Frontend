import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, input, output } from '@angular/core';
import { DROPDOWN_IMPORTS } from '../../../shared/ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileActionKind, fileMenuItems, FileRow } from '../files-view';

const MENU_BELOW_END: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'end',
  overlayY: 'top',
};
const MENU_ABOVE_END: ConnectedPosition = {
  originX: 'end',
  originY: 'top',
  overlayX: 'end',
  overlayY: 'bottom',
};

@Component({
  selector: 'app-file-menu',
  imports: [DROPDOWN_IMPORTS, IconButtonComponent, IconComponent],
  templateUrl: './file-menu.component.html',
  styleUrl: './file-menu.component.scss',
})
export class FileMenuComponent {
  readonly file = input.required<FileRow>();
  readonly action = output<FileActionKind>();

  protected readonly positions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly items = computed(() => fileMenuItems(this.file()));
  protected readonly menuLabel = computed(() => `Actions for ${this.file().name}`);
}
