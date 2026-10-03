import { CdkMenuTrigger } from '@angular/cdk/menu';
import { DropdownDividerComponent } from './dropdown-divider/dropdown-divider.component';
import { DropdownHeadingComponent } from './dropdown-heading/dropdown-heading.component';
import { DropdownItemComponent } from './dropdown-item/dropdown-item.component';
import { DropdownPanelDirective } from './dropdown-panel/dropdown-panel.directive';
import { DropdownComponent } from './dropdown.component';

export const DROPDOWN_IMPORTS = [
  DropdownComponent,
  DropdownItemComponent,
  DropdownHeadingComponent,
  DropdownDividerComponent,
  DropdownPanelDirective,
  CdkMenuTrigger,
] as const;
