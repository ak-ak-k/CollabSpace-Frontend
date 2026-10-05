import { Component, computed, input, output } from '@angular/core';
import { SearchGroupKey, SearchResult } from '../../../../core/data/search.data';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { LISTBOX_ID, PaletteOption, PaletteSection, rowCountOf } from '../palette-options';

const RESULT_TYPE_LABELS: Record<SearchResult['kind'], string> = {
  person: 'Person',
  message: 'Message',
  channel: 'Channel',
  team: 'Team',
  task: 'Task',
  file: 'File',
};

@Component({
  selector: 'app-search-options',
  imports: [AvatarComponent, IconButtonComponent, IconComponent],
  templateUrl: './search-options.component.html',
  styleUrl: './search-options.component.scss',
})
export class SearchOptionsComponent {
  readonly sections = input.required<readonly PaletteSection[]>();
  readonly activeIndex = input(0);
  readonly activated = output<PaletteOption>();
  readonly hovered = output<number>();
  readonly expanded = output<SearchGroupKey>();
  readonly removed = output<string>();
  readonly cleared = output<void>();
  readonly messaged = output<string>();

  protected readonly listboxId = LISTBOX_ID;
  protected readonly typeLabels = RESULT_TYPE_LABELS;
  protected readonly rowCount = computed(() => rowCountOf(this.sections()));

  protected hover(index: number): void {
    if (index !== this.activeIndex()) {
      this.hovered.emit(index);
    }
  }

  protected keepFieldFocused(event: Event): void {
    event.preventDefault();
  }
}
