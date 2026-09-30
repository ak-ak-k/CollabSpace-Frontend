import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';

const VISIBLE_RECTS = [{}] as unknown as DOMRectList;

describe('DialogService', () => {
  let service: DialogService;

  const stabilize = () => TestBed.inject(ApplicationRef).whenStable();
  const alertDialog = () => document.querySelector<HTMLElement>('[role="alertdialog"]');
  const button = (label: string) =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')).find(
      (candidate) => candidate.textContent?.trim() === label,
    ) as HTMLButtonElement;

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(VISIBLE_RECTS);
    service = TestBed.inject(DialogService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves true when the confirm button is pressed', async () => {
    const result = service.confirm({ title: 'Delete this task?', body: 'This cannot be undone.' });
    await stabilize();

    button('Confirm').click();

    await expect(result).resolves.toBe(true);
    expect(alertDialog()).toBeNull();
  });

  it('resolves false when Cancel is pressed', async () => {
    const result = service.confirm({ title: 'Delete this task?', body: 'This cannot be undone.' });
    await stabilize();

    button('Cancel').click();

    await expect(result).resolves.toBe(false);
  });

  it('resolves false when Escape is pressed', async () => {
    const result = service.confirm({ title: 'Sign out?', body: 'You can sign back in later.' });
    await stabilize();

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));

    await expect(result).resolves.toBe(false);
  });

  it('labels the alert dialog and starts on Cancel for a danger confirm', async () => {
    void service.confirm({ title: 'Delete this task?', body: 'This cannot be undone.' });
    await stabilize();

    const dialog = alertDialog() as HTMLElement;
    const title = document.getElementById(dialog.getAttribute('aria-labelledby') ?? '');
    const body = document.getElementById(dialog.getAttribute('aria-describedby') ?? '');

    expect(title?.textContent?.trim()).toBe('Delete this task?');
    expect(body?.textContent?.trim()).toBe('This cannot be undone.');
    expect(document.activeElement).toBe(button('Cancel'));
  });

  it('starts on the confirm button for a neutral confirm', async () => {
    void service.confirm({
      title: 'Sign out?',
      body: 'You can sign back in later.',
      confirmLabel: 'Sign out',
      tone: 'neutral',
    });
    await stabilize();

    expect(document.activeElement).toBe(button('Sign out'));
  });
});
