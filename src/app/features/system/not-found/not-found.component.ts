import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../core/services/search.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SystemPageComponent, USEFUL_PLACES } from '../system-page/system-page.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  protected readonly search = inject(SearchService);
  protected readonly lists = [USEFUL_PLACES];
}
