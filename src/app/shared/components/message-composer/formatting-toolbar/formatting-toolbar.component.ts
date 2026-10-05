import { Component, output } from '@angular/core';
import { IconButtonComponent } from '../../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../../ui/icon/icon.component';
import { FORMAT_TOOLS, FormatMark } from '../composer-format';

const TOOL_ICON_SIZE = 16;

@Component({
  selector: 'app-formatting-toolbar',
  imports: [IconComponent, IconButtonComponent],
  templateUrl: './formatting-toolbar.component.html',
  styleUrl: './formatting-toolbar.component.scss',
  host: {
    role: 'toolbar',
    'aria-label': 'Formatting',
  },
})
export class FormattingToolbarComponent {
  readonly format = output<FormatMark>();

  protected readonly tools = FORMAT_TOOLS;
  protected readonly iconSize = TOOL_ICON_SIZE;
}
