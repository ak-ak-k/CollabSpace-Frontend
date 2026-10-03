import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogData, resolveConfirmData } from './confirm-dialog-data';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  const close = vi.fn();

  const render = async (data: ConfirmDialogData) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: { id: 'confirm-dialog-test', close } },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => close.mockClear());

  it('renders the title, body and both actions', async () => {
    const host = await render(
      resolveConfirmData({ title: 'Delete this task?', body: 'This cannot be undone.' }),
    );
    const labels = Array.from(host.querySelectorAll('button')).map((button) =>
      button.textContent?.trim(),
    );

    expect(host.querySelector('#confirm-dialog-test-title')?.textContent?.trim()).toBe(
      'Delete this task?',
    );
    expect(host.querySelector('#confirm-dialog-test-body')?.textContent?.trim()).toBe(
      'This cannot be undone.',
    );
    expect(labels).toEqual(['Cancel', 'Confirm']);
  });

  it('requests initial focus on Cancel for the danger tone', async () => {
    const host = await render(resolveConfirmData({ title: 'Delete?', body: 'Gone for good.' }));

    expect(host.querySelector('[cdkfocusinitial]')?.textContent?.trim()).toBe('Cancel');
    expect(host.classList.contains('confirm-dialog--neutral')).toBe(false);
  });

  it('requests initial focus on the confirm button for the neutral tone', async () => {
    const host = await render(
      resolveConfirmData({ title: 'Sign out?', body: 'See you soon.', tone: 'neutral' }),
    );

    expect(host.querySelector('[cdkfocusinitial]')?.textContent?.trim()).toBe('Confirm');
    expect(host.classList.contains('confirm-dialog--neutral')).toBe(true);
  });

  it('closes with the chosen answer', async () => {
    const host = await render(resolveConfirmData({ title: 'Delete?', body: 'Gone for good.' }));
    const [cancel, confirm] = Array.from(host.querySelectorAll('button'));

    cancel.click();
    confirm.click();

    expect(close.mock.calls).toEqual([[false], [true]]);
  });

  it('keeps the confirm button disabled until the exact text is typed', async () => {
    const host = await render(
      resolveConfirmData({ title: 'Delete Acme?', body: 'Gone.', confirmText: 'Acme' }),
    );
    const input = host.querySelector('input') as HTMLInputElement;
    const confirm = Array.from(host.querySelectorAll('button')).at(-1) as HTMLButtonElement;

    expect(input.hasAttribute('cdkfocusinitial')).toBe(true);
    expect(confirm.disabled).toBe(true);

    input.value = 'Acme';
    input.dispatchEvent(new Event('input'));
    TestBed.tick();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(confirm.disabled).toBe(false);
    expect(close).toHaveBeenCalledWith(true);
  });
});
