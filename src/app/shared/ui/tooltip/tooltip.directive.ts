import { AriaDescriber } from '@angular/cdk/a11y';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  afterRenderEffect,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  Injector,
  input,
  Renderer2,
  untracked,
} from '@angular/core';
import { TooltipBubbleComponent } from './tooltip-bubble/tooltip-bubble.component';
import { TOOLTIP_SHOW_DELAY_MS, TooltipPosition, tooltipPositions } from './tooltip-position';

const TOUCH_DEVICE_QUERY = '(pointer: coarse)';
const TOUCH_POINTER_TYPE = 'touch';
const KEYBOARD_FOCUS_SELECTOR = ':focus-visible';
const DESCRIPTION_ROLE = 'tooltip';

@Directive({
  selector: '[appTooltip]',
  host: {
    '(pointerenter)': 'showForPointer($event)',
    '(pointerleave)': 'hide()',
    '(pointerdown)': 'hide()',
    '(focus)': 'showForKeyboardFocus()',
    '(blur)': 'hide()',
    '(keydown.escape)': 'dismiss($event)',
  },
})
export class TooltipDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly renderer = inject(Renderer2);
  private readonly ariaDescriber = inject(AriaDescriber);
  private readonly view = inject(DOCUMENT).defaultView;

  private overlayRef: OverlayRef | undefined;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private stopScrollListener: (() => void) | undefined;
  private describedText = '';

  readonly appTooltip = input.required<string>();
  readonly tooltipPosition = input<TooltipPosition>('top');

  constructor() {
    afterRenderEffect(() => {
      const text = this.appTooltip();
      untracked(() => this.describeHost(text));
    });
    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  protected showForPointer(event: PointerEvent): void {
    if (event.pointerType !== TOUCH_POINTER_TYPE) {
      this.showAfterDelay();
    }
  }

  protected showForKeyboardFocus(): void {
    if (this.host.matches(KEYBOARD_FOCUS_SELECTOR)) {
      this.showAfterDelay();
    }
  }

  protected dismiss(event: Event): void {
    if (this.overlayRef) {
      event.stopPropagation();
    }
    this.hide();
  }

  protected hide(): void {
    clearTimeout(this.showTimer);
    this.stopScrollListener?.();
    this.stopScrollListener = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  private showAfterDelay(): void {
    if (this.isTouchDevice() || !this.appTooltip()) {
      return;
    }
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), TOOLTIP_SHOW_DELAY_MS);
  }

  private show(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = createOverlayRef(this.injector, this.overlayConfig());
    const bubble = this.overlayRef.attach(new ComponentPortal(TooltipBubbleComponent));
    bubble.setInput('text', this.appTooltip());
    bubble.changeDetectorRef.detectChanges();
    this.overlayRef.updatePosition();
    this.hideOnScroll();
  }

  private overlayConfig(): OverlayConfig {
    const positionStrategy = createFlexibleConnectedPositionStrategy(this.injector, this.host)
      .withPositions(tooltipPositions(this.tooltipPosition()))
      .withPush(true);
    return new OverlayConfig({ positionStrategy });
  }

  private hideOnScroll(): void {
    this.stopScrollListener = this.renderer.listen('document', 'scroll', () => this.hide(), {
      capture: true,
      passive: true,
    });
  }

  private isTouchDevice(): boolean {
    return this.view?.matchMedia?.(TOUCH_DEVICE_QUERY).matches ?? false;
  }

  private describeHost(text: string): void {
    this.ariaDescriber.removeDescription(this.host, this.describedText, DESCRIPTION_ROLE);
    this.ariaDescriber.describe(this.host, text, DESCRIPTION_ROLE);
    this.describedText = text;
  }

  private destroy(): void {
    this.hide();
    this.describeHost('');
  }
}
