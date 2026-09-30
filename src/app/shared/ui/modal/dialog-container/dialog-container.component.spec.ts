import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogService } from '../../../../core/services/dialog.service';
import { ModalComponent } from '../modal.component';

const VISIBLE_RECTS = [{}] as unknown as DOMRectList;

@Component({
  imports: [ModalComponent],
  template: `
    <app-modal heading="New task">
      <label>Title <input name="title" /></label>
    </app-modal>
  `,
})
class TaskDialogComponent {}

describe('DialogContainerComponent', () => {
  const stabilize = () => TestBed.inject(ApplicationRef).whenStable();
  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
  const pane = () => document.querySelector<HTMLElement>('.app-dialog-pane') as HTMLElement;

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(VISIBLE_RECTS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the content in a dialog labelled by the modal title', async () => {
    TestBed.inject(DialogService).open(TaskDialogComponent, { size: 'lg' });
    await stabilize();

    const title = document.getElementById(dialog()?.getAttribute('aria-labelledby') ?? '');

    expect(title?.textContent?.trim()).toBe('New task');
    expect(pane().classList.contains('app-dialog-pane--lg')).toBe(true);
  });

  it('moves focus to the first field', async () => {
    TestBed.inject(DialogService).open(TaskDialogComponent);
    await stabilize();

    expect(document.activeElement).toBe(dialog()?.querySelector('input'));
  });

  it('closes when the area around the dialog is clicked', async () => {
    const dialogRef = TestBed.inject(DialogService).open(TaskDialogComponent);
    const closed = vi.fn();
    dialogRef.closed.subscribe(closed);
    await stabilize();

    dialog()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closed).not.toHaveBeenCalled();

    pane().dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    pane().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('attaches a drawer to the chosen edge', async () => {
    TestBed.inject(DialogService).openDrawer(TaskDialogComponent, {
      side: 'left',
      size: 'sm',
      ariaLabel: 'Menu',
    });
    await stabilize();

    const drawerPane = document.querySelector('.app-drawer-pane') as HTMLElement;

    expect(drawerPane.classList.contains('app-drawer-pane--left')).toBe(true);
    expect(drawerPane.classList.contains('app-drawer-pane--sm')).toBe(true);
    expect(dialog()?.getAttribute('aria-label')).toBe('Menu');
  });
});
