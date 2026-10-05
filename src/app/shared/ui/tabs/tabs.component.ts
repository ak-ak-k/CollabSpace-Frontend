import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';
import { ScrollEdgesDirective } from './scroll-edges.directive';

export interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
  readonly countLabel?: string;
  readonly icon?: IconName;
  readonly link?: string | readonly unknown[];
}

export type TabsGap = 'md' | 'lg';
export type TabsSize = 'md' | 'lg';

type KeyboardStep = (currentIndex: number, tabCount: number) => number;

const KEYBOARD_STEPS: Partial<Record<string, KeyboardStep>> = {
  ArrowRight: (currentIndex, tabCount) => (currentIndex + 1) % tabCount,
  ArrowLeft: (currentIndex, tabCount) => (currentIndex - 1 + tabCount) % tabCount,
  Home: () => 0,
  End: (_currentIndex, tabCount) => tabCount - 1,
};

@Component({
  selector: 'app-tabs',
  imports: [IconComponent, RouterLink, ScrollEdgesDirective],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  host: {
    '[class.tabs--lg]': "size() === 'lg'",
    '[class.tabs--gap-lg]': "gap() === 'lg'",
    '[class.tabs--bleed]': 'bleed()',
    '[class.tabs--wrap]': 'wrap()',
  },
})
export class TabsComponent {
  readonly label = input.required<string>();
  readonly tabs = input<readonly TabItem[]>([]);
  readonly gap = input<TabsGap>('md');
  readonly size = input<TabsSize>('md');
  readonly bleed = input(false, { transform: booleanAttribute });
  readonly wrap = input(false, { transform: booleanAttribute });
  readonly active = model('');

  protected readonly isNavigation = computed(
    () => this.tabs().length > 0 && this.tabs().every((tab) => tab.link !== undefined),
  );
  protected readonly focusableId = computed(() => {
    const tabs = this.tabs();
    const activeTab = tabs.find((tab) => tab.id === this.active());
    return (activeTab ?? tabs.at(0))?.id ?? '';
  });

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly scrollEdges = viewChild.required(ScrollEdgesDirective);
  private readonly edgeFade = viewChild.required<ElementRef<HTMLElement>>('edgeFade');
  private readonly tabElements = viewChildren<ElementRef<HTMLElement>>('tabElement');
  private readonly activeElement = computed(() => {
    const activeIndex = this.tabs().findIndex((tab) => tab.id === this.active());
    return activeIndex < 0 ? undefined : this.tabElements().at(activeIndex)?.nativeElement;
  });

  constructor() {
    afterRenderEffect(() => {
      this.reveal(this.activeElement());
      this.scrollEdges().measure();
    });
  }

  protected hasCount(tab: TabItem): boolean {
    return (tab.count ?? 0) > 0;
  }

  protected moveWithKeyboard(event: KeyboardEvent): void {
    const step = KEYBOARD_STEPS[event.key];
    const tabCount = this.tabs().length;
    if (!step || tabCount === 0) {
      return;
    }
    event.preventDefault();
    this.activateAndFocus(step(this.focusableIndex(), tabCount));
  }

  private focusableIndex(): number {
    return this.tabs().findIndex((tab) => tab.id === this.focusableId());
  }

  private activateAndFocus(index: number): void {
    const tab = this.tabs().at(index);
    if (!tab) {
      return;
    }
    this.active.set(tab.id);
    this.tabElements().at(index)?.nativeElement.focus();
  }

  private reveal(tab: HTMLElement | undefined): void {
    if (!tab) {
      return;
    }
    const viewport = this.viewport().nativeElement;
    const fadeWidth = this.edgeFade().nativeElement.offsetWidth;
    const viewportBox = viewport.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const hiddenBeforeStart = tabBox.left - viewportBox.left - fadeWidth;
    const hiddenAfterEnd = tabBox.right - viewportBox.right + fadeWidth;

    if (hiddenBeforeStart < 0) {
      viewport.scrollLeft += hiddenBeforeStart;
    } else if (hiddenAfterEnd > 0) {
      viewport.scrollLeft += hiddenAfterEnd;
    }
  }
}
