import { Component, computed, inject, input, signal } from '@angular/core';
import { ConversationFilter } from '../../../core/models/conversation';
import { DialogService } from '../../../core/services/dialog.service';
import { SearchService } from '../../../core/services/search.service';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ConversationItemComponent } from '../../../shared/components/conversation-item/conversation-item.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { NewGroupDialogComponent } from '../new-group-dialog/new-group-dialog.component';
import {
  CONVERSATION_FILTERS,
  FILTER_EMPTY_STATES,
  FILTER_LABELS,
  FilterEmptyState,
  isCountedFilter,
  matchesFilter,
  matchesQuery,
  searchEmptyState,
} from './conversation-filters';

@Component({
  selector: 'app-conversation-list',
  imports: [
    ConversationItemComponent,
    EmptyStateComponent,
    SkeletonComponent,
    IconButtonComponent,
    IconComponent,
    SearchInputComponent,
    TabsComponent,
  ],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss',
})
export class ConversationListComponent {
  private readonly chat = inject(ChatState);
  private readonly workspace = inject(WorkspaceState);
  private readonly dialogs = inject(DialogService);
  private readonly search = inject(SearchService);

  readonly selectedId = input<string | null>(null);

  protected readonly query = signal('');
  protected readonly filter = signal<ConversationFilter>('all');

  protected readonly status = computed(() =>
    this.workspace.status() === 'ready' ? this.chat.status() : this.workspace.status(),
  );
  protected readonly tabs = computed<readonly TabItem[]>(() =>
    CONVERSATION_FILTERS.map((filter) => ({
      id: filter,
      label: FILTER_LABELS[filter],
      count: isCountedFilter(filter) ? this.countFor(filter) : 0,
    })),
  );
  protected readonly conversations = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.chat
      .previews()
      .filter((preview) => matchesFilter(preview, this.filter()) && matchesQuery(preview, query));
  });
  protected readonly noMatch = computed(() => this.conversations().length === 0);
  protected readonly emptyState = computed<FilterEmptyState>(() => {
    const query = this.query().trim();
    return query ? searchEmptyState(query) : FILTER_EMPTY_STATES[this.filter()];
  });

  protected selectFilter(filter: string): void {
    const match = CONVERSATION_FILTERS.find((candidate) => candidate === filter);
    if (match) {
      this.filter.set(match);
    }
  }

  protected newGroup(): void {
    this.dialogs.open(NewGroupDialogComponent, { size: 'md' });
  }

  protected findPeople(): void {
    this.search.open('people');
  }

  protected reload(): void {
    void this.workspace.reload();
    void this.chat.reload();
  }

  private countFor(filter: ConversationFilter): number {
    return this.chat.previews().filter((preview) => matchesFilter(preview, filter)).length;
  }
}
