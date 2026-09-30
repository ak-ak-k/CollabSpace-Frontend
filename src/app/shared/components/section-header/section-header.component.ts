import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-header',
  imports: [RouterLink],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
})
export class SectionHeaderComponent {
  readonly headingId = input.required<string>();
  readonly heading = input.required<string>();
  readonly linkLabel = input('');
  readonly link = input('');
  readonly caption = input('');
}
