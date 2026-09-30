import { ConnectedPosition } from '@angular/cdk/overlay';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export const TOOLTIP_SHOW_DELAY_MS = 400;

const TOOLTIP_GAP_PX = 6;

const CONNECTED_POSITIONS: Record<TooltipPosition, ConnectedPosition> = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
    offsetY: -TOOLTIP_GAP_PX,
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: TOOLTIP_GAP_PX,
  },
  left: {
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
    offsetX: -TOOLTIP_GAP_PX,
  },
  right: {
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
    offsetX: TOOLTIP_GAP_PX,
  },
};

const OPPOSITE_POSITIONS: Record<TooltipPosition, TooltipPosition> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export function tooltipPositions(preferred: TooltipPosition): ConnectedPosition[] {
  return [CONNECTED_POSITIONS[preferred], CONNECTED_POSITIONS[OPPOSITE_POSITIONS[preferred]]];
}
