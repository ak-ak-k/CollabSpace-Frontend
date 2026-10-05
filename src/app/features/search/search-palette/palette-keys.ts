export type ActiveStep = (current: number, last: number) => number;

export const FIRST_INDEX = 0;

export const ACTIVE_STEPS: Readonly<Partial<Record<string, ActiveStep>>> = {
  ArrowDown: (current, last) => Math.min(last, current + 1),
  ArrowUp: (current) => Math.max(FIRST_INDEX, current - 1),
  Home: () => FIRST_INDEX,
  End: (_current, last) => last,
};

export const hasModifier = (event: KeyboardEvent): boolean =>
  event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;

export const isShiftEnter = (event: KeyboardEvent): boolean =>
  event.key === 'Enter' && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
