import { CdkMenuTrigger } from '@angular/cdk/menu';
import { DropdownDividerComponent } from './dropdown-divider/dropdown-divider.component';
import { DropdownHeadingComponent } from './dropdown-heading/dropdown-heading.component';
import { DropdownItemComponent } from './dropdown-item/dropdown-item.component';
import { DropdownComponent } from './dropdown.component';

export const DROPDOWN_IMPORTS = [
  DropdownComponent,
  DropdownItemComponent,
  DropdownHeadingComponent,
  DropdownDividerComponent,
  CdkMenuTrigger,
] as const;
