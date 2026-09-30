import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip-bubble',
  templateUrl: './tooltip-bubble.component.html',
  styleUrl: './tooltip-bubble.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class TooltipBubbleComponent {
  readonly text = input.required<string>();
}
