import { Component, input } from '@angular/core';

@Component({
  selector: 'app-secondary-sidebar',
  templateUrl: './secondary-sidebar.component.html',
  styleUrl: './secondary-sidebar.component.scss',
})
export class SecondarySidebarComponent {
  readonly label = input.required<string>();
}
