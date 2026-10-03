import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { SearchFilter, SearchService } from '../../../../core/services/search.service';
import { ThemeState } from '../../../../core/state/theme.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { jumpCommands, messageCommands } from '../palette-commands';
import {
  idleDrafts,
  layOutSections,
  LISTBOX_ID,
  optionsOf,
  PaletteOption,
  resultDrafts,
} from '../palette-options';
import { PaletteRunner } from '../palette-runner';
import { paletteShortcutFor } from '../platform-shortcut';
import {
  SearchFilterCounts,
  SearchFiltersComponent,
} from '../search-filters/search-filters.component';
import { SearchOptionsComponent } from '../search-options/search-options.component';
import { SearchSession } from '../search-session';
import { SearchStatusComponent } from '../search-status/search-status.component';

type ActiveStep = (current: number, last: number) => number;

const FIRST_INDEX = 0;

const ACTIVE_STEPS: Readonly<Partial<Record<string, ActiveStep>>> = {
  ArrowDown: (current, last) => Math.min(last, current + 1),
  ArrowUp: (current) => Math.max(FIRST_INDEX, current - 1),
  Home: () => FIRST_INDEX,
  End: (_current, last) => last,
};

const hasModifier = (event: KeyboardEvent): boolean =>
  event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;

@Component({
  selector: 'app-search-panel',
  imports: [
    CdkTrapFocus,
    IconComponent,
    IconButtonComponent,
    SpinnerComponent,
    SearchFiltersComponent,
    SearchOptionsComponent,
    SearchStatusComponent,
  ],
  providers: [SearchSession],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  host: { '(keydown.escape)': 'closeWithKey($event)' },
})
export class SearchPanelComponent {
  private readonly search = inject(SearchService);
  private readonly workspace = inject(WorkspaceState);
  private readonly theme = inject(ThemeState);
  private readonly runner = inject(PaletteRunner);
  private readonly document = inject(DOCUMENT);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  private opener: Element | null = this.document.activeElement;

  protected readonly session = inject(SearchSession);
  protected readonly isMobile = inject(BreakpointService).isMobile;
  protected readonly listboxId = LISTBOX_ID;
  protected readonly shortcut = paletteShortcutFor(
    this.document.defaultView?.navigator.userAgent ?? '',
  );
  protected readonly closeLabel = computed(() => (this.isMobile() ? 'Cancel' : 'Esc'));
  protected readonly closeName = computed(() =>
    this.isMobile() ? 'Cancel search' : 'Close search (Esc)',
  );

  private readonly commands = computed(() =>
    this.session.filter() === 'people'
      ? messageCommands(this.workspace.members())
      : jumpCommands(this.theme.isDark(), this.workspace.currentWorkspace()?.name),
  );
  private readonly recentSearches = computed(() =>
    this.session.filter() === 'people' ? [] : this.search.recentSearches(),
  );

  protected readonly sections = computed(() =>
    layOutSections(
      this.session.hasQuery()
        ? resultDrafts(this.session.groups())
        : idleDrafts(this.recentSearches(), this.commands()),
    ),
  );
  protected readonly options = computed(() => optionsOf(this.sections()));
  protected readonly hasOptions = computed(() => this.options().length > 0);
  protected readonly counts = computed<SearchFilterCounts>(() =>
    this.session.filter() === 'all'
      ? Object.fromEntries(this.session.groups().map((group) => [group.key, group.total]))
      : {},
  );

  protected readonly requestedIndex = linkedSignal({
    source: () => [this.options(), this.session.query(), this.session.filter()],
    computation: () => FIRST_INDEX,
  });
  protected readonly activeIndex = computed(() =>
    Math.min(this.requestedIndex(), this.options().length - 1),
  );
  protected readonly activeOption = computed(
    () => this.options().find((option) => option.index === this.activeIndex()) ?? null,
  );

  constructor() {
    afterNextRender(() => this.focusField());
    inject(DestroyRef).onDestroy(() => this.restoreFocus());
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.search.close());
  }

  protected close(): void {
    this.search.close();
    this.restoreFocus();
  }

  protected closeWithKey(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  protected clear(): void {
    this.session.setQuery('');
    this.focusField();
  }

  protected pickFilter(picked: SearchFilter): void {
    this.session.setFilter(picked);
    this.focusField();
  }

  protected removeRecent(query: string): void {
    this.search.removeRecent(query);
    this.focusField();
  }

  protected handleKey(event: KeyboardEvent): void {
    if (event.isComposing || hasModifier(event)) {
      return;
    }
    const step = ACTIVE_STEPS[event.key];
    if (step) {
      this.moveActive(event, step);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.activateCurrent();
    }
  }

  protected activate(option: PaletteOption): void {
    switch (option.type) {
      case 'recent':
        this.session.setQuery(option.query);
        this.focusField();
        break;
      case 'command':
        this.close();
        this.runner.run(option.command.action);
        break;
      case 'result':
        this.search.addRecent(this.session.term());
        this.close();
        this.runner.open(option.result.target);
        break;
    }
  }

  private activateCurrent(): void {
    const option = this.activeOption();
    if (option) {
      this.activate(option);
    }
  }

  private moveActive(event: KeyboardEvent, step: ActiveStep): void {
    const lastIndex = this.options().length - 1;
    if (lastIndex < FIRST_INDEX) {
      return;
    }
    event.preventDefault();
    this.requestedIndex.set(step(this.activeIndex(), lastIndex));
    this.revealActive();
  }

  private revealActive(): void {
    const option = this.activeOption();
    if (option?.index === FIRST_INDEX) {
      this.body().nativeElement.scrollTop = 0;
    } else if (option) {
      this.document.getElementById(option.id)?.scrollIntoView?.({ block: 'nearest' });
    }
  }

  private focusField(): void {
    this.field().nativeElement.focus();
  }

  private restoreFocus(): void {
    const opener = this.opener;
    this.opener = null;
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
    }
  }
}
