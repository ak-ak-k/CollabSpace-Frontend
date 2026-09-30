import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const TABLET_QUERY = '(min-width: 768px)';
const DESKTOP_QUERY = '(min-width: 1200px)';
const WIDE_DESKTOP_QUERY = '(min-width: 1280px)';

@Service()
export class BreakpointService {
  private readonly observer = inject(BreakpointObserver);

  private readonly matches = toSignal(
    this.observer
      .observe([TABLET_QUERY, DESKTOP_QUERY, WIDE_DESKTOP_QUERY])
      .pipe(map((state) => state.breakpoints)),
    { initialValue: this.currentMatches() },
  );

  readonly breakpoint = computed<Breakpoint>(() => {
    const matches = this.matches();
    if (matches[DESKTOP_QUERY]) {
      return 'desktop';
    }
    return matches[TABLET_QUERY] ? 'tablet' : 'mobile';
  });

  readonly isMobile = computed(() => this.breakpoint() === 'mobile');
  readonly isTablet = computed(() => this.breakpoint() === 'tablet');
  readonly isDesktop = computed(() => this.breakpoint() === 'desktop');
  readonly isWideDesktop = computed(() => this.matches()[WIDE_DESKTOP_QUERY] === true);

  private currentMatches(): Record<string, boolean> {
    return {
      [TABLET_QUERY]: this.observer.isMatched(TABLET_QUERY),
      [DESKTOP_QUERY]: this.observer.isMatched(DESKTOP_QUERY),
      [WIDE_DESKTOP_QUERY]: this.observer.isMatched(WIDE_DESKTOP_QUERY),
    };
  }
}
