import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  Injector,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { DIALOG_INITIAL_FOCUS } from './dialog-panel';

const REQUESTED_FOCUS_SELECTOR = '[cdkFocusInitial]';
const FIRST_FIELD_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';

@Component({
  selector: 'app-dialog-container',
  imports: [CdkPortalOutlet],
  templateUrl: './dialog-container.component.html',
  styleUrl: './dialog-container.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'dialog-container' },
})
export class DialogContainerComponent extends CdkDialogContainer {
  private readonly pane = inject(OverlayRef).overlayElement;
  private readonly dialogRef = inject(DialogRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly initialFocus = inject(DIALOG_INITIAL_FOCUS, { optional: true });
  private pressStartedOnPane = false;

  constructor() {
    super();
    this.closeWhenPaneIsClicked();
  }

  registerLabel(id: string): void {
    this._addAriaLabelledBy(id);
  }

  unregisterLabel(id: string): void {
    this._removeAriaLabelledBy(id);
  }

  protected override _captureInitialFocus(): void {
    super._captureInitialFocus();
    if (this.initialFocus === 'first-field') {
      afterNextRender(() => this.focusFirstField(), { injector: this.injector });
    }
  }

  private focusFirstField(): void {
    const host = this._elementRef.nativeElement;
    if (host.querySelector(REQUESTED_FOCUS_SELECTOR)) {
      return;
    }
    host.querySelector<HTMLElement>(FIRST_FIELD_SELECTOR)?.focus();
  }

  private closeWhenPaneIsClicked(): void {
    const stopPressListener = this.renderer.listen(this.pane, 'pointerdown', (event: Event) => {
      this.pressStartedOnPane = event.target === this.pane;
    });
    const stopClickListener = this.renderer.listen(this.pane, 'click', (event: Event) =>
      this.closeFromPane(event),
    );
    inject(DestroyRef).onDestroy(() => {
      stopPressListener();
      stopClickListener();
    });
  }

  private closeFromPane(event: Event): void {
    const clickedPane = event.target === this.pane && this.pressStartedOnPane;
    this.pressStartedOnPane = false;
    if (clickedPane && !this.dialogRef.disableClose) {
      this.dialogRef.close(undefined, { focusOrigin: 'mouse' });
    }
  }
}
