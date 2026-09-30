import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown-divider',
  templateUrl: './dropdown-divider.component.html',
  styleUrl: './dropdown-divider.component.scss',
  host: { role: 'separator' },
})
export class DropdownDividerComponent {}
