import { Component } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ICON_NAMES } from '../../../shared/ui/icon/icon-registry';
import {
  COLOR_GROUPS,
  cssVariable,
  FONT_SIZES,
  SHADOWS,
  SPACING,
  TEXT_COLORS,
} from './foundation-tokens';

@Component({
  selector: 'app-styleguide-foundations',
  imports: [IconComponent],
  templateUrl: './foundations.component.html',
  styleUrl: './foundations.component.scss',
})
export class FoundationsComponent {
  protected readonly colorGroups = COLOR_GROUPS;
  protected readonly textColors = TEXT_COLORS;
  protected readonly fontSizes = FONT_SIZES;
  protected readonly spacing = SPACING;
  protected readonly shadows = SHADOWS;
  protected readonly iconNames = ICON_NAMES;
  protected readonly cssVariable = cssVariable;
}
