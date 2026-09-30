import { InjectionToken } from '@angular/core';

export type OverlaySize = 'sm' | 'md' | 'lg';
export type DrawerSide = 'left' | 'right' | 'bottom';
export type DialogInitialFocus = 'first-field' | 'first-tabbable';

export const OVERLAY_BACKDROP_CLASS = 'app-overlay-backdrop';
export const DIALOG_PANE_CLASS = 'app-dialog-pane';
export const DIALOG_PANE_CENTERED_CLASS = 'app-dialog-pane--centered';
export const DRAWER_PANE_CLASS = 'app-drawer-pane';

export const DIALOG_INITIAL_FOCUS = new InjectionToken<DialogInitialFocus>('DIALOG_INITIAL_FOCUS');

export function dialogPaneClasses(size: OverlaySize): string[] {
  return [DIALOG_PANE_CLASS, `${DIALOG_PANE_CLASS}--${size}`];
}

export function drawerPaneClasses(side: DrawerSide, size: OverlaySize): string[] {
  return [DRAWER_PANE_CLASS, `${DRAWER_PANE_CLASS}--${side}`, `${DRAWER_PANE_CLASS}--${size}`];
}
