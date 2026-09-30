import { Component, inject } from '@angular/core';
import { SearchService } from '../../../core/services/search.service';
import { SearchPanelComponent } from './search-panel/search-panel.component';

@Component({
  selector: 'app-search-palette',
  imports: [SearchPanelComponent],
  templateUrl: './search-palette.component.html',
  styleUrl: './search-palette.component.scss',
})
export class SearchPaletteComponent {
  protected readonly search = inject(SearchService);
}
