import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  ConnectedPosition,
  createFlexibleConnectedPositionStrategy,
  OVERLAY_DEFAULT_CONFIG,
  OverlayDefaultConfig,
} from '@angular/cdk/overlay';
import {
  createEnvironmentInjector,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Service,
} from '@angular/core';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { DialogService } from '../../core/services/dialog.service';
import { DialogContainerComponent } from '../../shared/ui/modal/dialog-container/dialog-container.component';
import { DIALOG_INITIAL_FOCUS } from '../../shared/ui/modal/dialog-container/dialog-panel';
import { FileFiltersData, FilesFiltersComponent } from './files-filters/files-filters.component';

const POPOVER_GAP = 6;
const VIEWPORT_MARGIN = 8;
const TRANSPARENT_BACKDROP_CLASS = 'cdk-overlay-transparent-backdrop';
const INLINE_OVERLAYS: OverlayDefaultConfig = { usePopover: false };

const BELOW_START: ConnectedPosition = {
  originX: 'start',
  originY: 'bottom',
  overlayX: 'start',
  overlayY: 'top',
  offsetY: POPOVER_GAP,
};
const BELOW_END: ConnectedPosition = { ...BELOW_START, originX: 'end', overlayX: 'end' };

@Service()
export class FileFiltersDialog {
  private readonly overlayInjector = createEnvironmentInjector(
    [{ provide: OVERLAY_DEFAULT_CONFIG, useValue: INLINE_OVERLAYS }, Dialog],
    inject(EnvironmentInjector),
  );
  private readonly dialog = this.overlayInjector.get(Dialog);
  private readonly dialogs = inject(DialogService);
  private readonly breakpoint = inject(BreakpointService);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayInjector.destroy());
  }

  open(anchor: HTMLElement, data: FileFiltersData): DialogRef<unknown, unknown> {
    if (this.breakpoint.isMobile()) {
      return this.dialogs.openDrawer<unknown, FileFiltersData>(FilesFiltersComponent, {
        side: 'bottom',
        data,
      });
    }
    return this.dialog.open<unknown, FileFiltersData>(FilesFiltersComponent, {
      data,
      container: {
        type: DialogContainerComponent,
        providers: () => [{ provide: DIALOG_INITIAL_FOCUS, useValue: 'first-tabbable' }],
      },
      hasBackdrop: true,
      backdropClass: TRANSPARENT_BACKDROP_CLASS,
      positionStrategy: createFlexibleConnectedPositionStrategy(this.overlayInjector, anchor)
        .withPositions([BELOW_START, BELOW_END])
        .withViewportMargin(VIEWPORT_MARGIN)
        .withFlexibleDimensions(false)
        .withPush(true),
    });
  }
}
