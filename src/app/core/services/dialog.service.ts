import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  ComponentType,
  createGlobalPositionStrategy,
  GlobalPositionStrategy,
  OVERLAY_DEFAULT_CONFIG,
  OverlayDefaultConfig,
} from '@angular/cdk/overlay';
import {
  createEnvironmentInjector,
  DestroyRef,
  DOCUMENT,
  EnvironmentInjector,
  inject,
  Service,
  StaticProvider,
} from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import {
  confirmBodyId,
  ConfirmDialogData,
  ConfirmOptions,
  confirmTitleId,
  resolveConfirmData,
} from '../../shared/ui/confirm-dialog/confirm-dialog-data';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { DialogContainerComponent } from '../../shared/ui/modal/dialog-container/dialog-container.component';
import {
  DIALOG_INITIAL_FOCUS,
  DIALOG_PANE_CENTERED_CLASS,
  DialogInitialFocus,
  dialogPaneClasses,
  drawerPaneClasses,
  DrawerSide,
  OVERLAY_BACKDROP_CLASS,
  OverlaySize,
} from '../../shared/ui/modal/dialog-container/dialog-panel';
import { createOverlayId } from '../../shared/ui/modal/overlay-id';

export type {
  ConfirmOptions,
  ConfirmTone,
} from '../../shared/ui/confirm-dialog/confirm-dialog-data';
export type { DrawerSide, OverlaySize } from '../../shared/ui/modal/dialog-container/dialog-panel';

export interface DialogOptions<Data> {
  readonly data?: Data;
  readonly size?: OverlaySize;
  readonly ariaLabelledBy?: string;
}

export interface DrawerOptions<Data> {
  readonly data?: Data;
  readonly side?: DrawerSide;
  readonly size?: OverlaySize;
  readonly ariaLabel?: string;
}

const DEFAULT_SIZE: OverlaySize = 'md';
const DEFAULT_DRAWER_SIDE: DrawerSide = 'right';
const CONFIRM_SIZE: OverlaySize = 'sm';
const STACKED_OVERLAYS: OverlayDefaultConfig = { usePopover: false };
const MENU_SELECTOR = '[role="menu"]';
const OPEN_MENU_TRIGGER_SELECTOR = '[aria-haspopup="menu"][aria-expanded="true"]';

function containerFocusing(initialFocus: DialogInitialFocus) {
  return {
    type: DialogContainerComponent,
    providers: (): StaticProvider[] => [{ provide: DIALOG_INITIAL_FOCUS, useValue: initialFocus }],
  };
}

@Service()
export class DialogService {
  private readonly overlayInjector = createEnvironmentInjector(
    [{ provide: OVERLAY_DEFAULT_CONFIG, useValue: STACKED_OVERLAYS }, Dialog],
    inject(EnvironmentInjector),
  );
  private readonly dialog = this.overlayInjector.get(Dialog);
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayInjector.destroy());
  }

  open<Result = unknown, Data = unknown>(
    component: ComponentType<unknown>,
    options: DialogOptions<Data> = {},
  ): DialogRef<Result> {
    return this.dialog.open<Result, Data>(component, {
      ...this.sharedConfig('first-field'),
      panelClass: dialogPaneClasses(options.size ?? DEFAULT_SIZE),
      data: options.data,
      ariaLabelledBy: options.ariaLabelledBy,
    });
  }

  openDrawer<Result = unknown, Data = unknown>(
    component: ComponentType<unknown>,
    options: DrawerOptions<Data> = {},
  ): DialogRef<Result> {
    const side = options.side ?? DEFAULT_DRAWER_SIDE;
    return this.dialog.open<Result, Data>(component, {
      ...this.sharedConfig('first-tabbable'),
      panelClass: drawerPaneClasses(side, options.size ?? DEFAULT_SIZE),
      positionStrategy: this.edgePosition(side),
      data: options.data,
      ariaLabel: options.ariaLabel,
    });
  }

  confirm(options: ConfirmOptions): Promise<boolean> {
    const id = createOverlayId('confirm-dialog');
    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      ...this.sharedConfig('first-tabbable'),
      id,
      role: 'alertdialog',
      panelClass: [...dialogPaneClasses(CONFIRM_SIZE), DIALOG_PANE_CENTERED_CLASS],
      data: resolveConfirmData(options),
      ariaLabelledBy: confirmTitleId(id),
      ariaDescribedBy: confirmBodyId(id),
    });
    const confirmed = dialogRef.closed.pipe(map((result) => result === true));
    return firstValueFrom(confirmed, { defaultValue: false });
  }

  private sharedConfig(initialFocus: DialogInitialFocus) {
    return {
      container: containerFocusing(initialFocus),
      backdropClass: OVERLAY_BACKDROP_CLASS,
      restoreFocus: this.focusTargetAfterClose(),
    };
  }

  private focusTargetAfterClose(): HTMLElement | boolean {
    const openedFromMenu = this.document.activeElement?.closest(MENU_SELECTOR);
    const menuTrigger = this.document.querySelector<HTMLElement>(OPEN_MENU_TRIGGER_SELECTOR);
    return openedFromMenu && menuTrigger ? menuTrigger : true;
  }

  private edgePosition(side: DrawerSide): GlobalPositionStrategy {
    const strategy = createGlobalPositionStrategy(this.overlayInjector);
    if (side === 'bottom') {
      return strategy.bottom().centerHorizontally();
    }
    return side === 'left' ? strategy.top().left() : strategy.top().right();
  }
}
