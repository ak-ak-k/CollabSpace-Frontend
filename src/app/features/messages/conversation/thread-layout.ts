import {
  afterNextRender,
  computed,
  effect,
  inject,
  Injector,
  Signal,
  untracked,
} from '@angular/core';
import { BreakpointService } from '../../../core/services/breakpoint.service';

export type ThreadPanelMode = 'docked' | 'overlay' | 'fullscreen';

export interface ThreadLayoutOptions {
  readonly conversationId: () => string;
  readonly rootId: () => string | null;
  readonly restoreFocus: (closedRootId: string) => void;
}

interface OpenThread {
  readonly conversationId: string;
  readonly rootId: string | null;
}

const closedRootOf = (previous: OpenThread, current: OpenThread): string | null =>
  previous.conversationId === current.conversationId && current.rootId === null
    ? previous.rootId
    : null;

export const injectThreadLayout = (
  options: ThreadLayoutOptions,
): Signal<ThreadPanelMode | null> => {
  const breakpoint = inject(BreakpointService);
  const injector = inject(Injector);
  let previous: OpenThread = { conversationId: '', rootId: null };
  effect(() => {
    const current = { conversationId: options.conversationId(), rootId: options.rootId() };
    const closedRoot = closedRootOf(previous, current);
    previous = current;
    if (closedRoot) {
      untracked(() => afterNextRender(() => options.restoreFocus(closedRoot), { injector }));
    }
  });
  return computed(() => {
    if (!options.rootId()) {
      return null;
    }
    if (breakpoint.isDesktop()) {
      return 'docked';
    }
    return breakpoint.isMobile() ? 'fullscreen' : 'overlay';
  });
};
