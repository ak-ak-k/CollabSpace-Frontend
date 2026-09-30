import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../../../core/services/toast.service';
import { OverlaysSectionComponent } from './overlays-section.component';

describe('OverlaysSectionComponent', () => {
  let fixture: ComponentFixture<OverlaysSectionComponent>;
  let host: HTMLElement;

  const button = (label: string) =>
    Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.trim() === label,
    ) as HTMLButtonElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OverlaysSectionComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    const toasts = TestBed.inject(ToastService);
    toasts.toasts().forEach((toast) => toasts.dismiss(toast.id));
  });

  it('shows a titled block for every overlay', () => {
    const titles = Array.from(host.querySelectorAll('h3')).map((title) =>
      title.textContent?.trim(),
    );

    expect(titles).toEqual(['Toast', 'Modal', 'Confirm dialog', 'Drawer', 'Dropdown', 'Tooltip']);
  });

  it('raises a toast with an Undo action', () => {
    button('Toast with Undo').click();

    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ message: 'Conversation archived', actionLabel: 'Undo' }),
    ]);
  });

  it('shows the answer of a confirm dialog on the page', async () => {
    button('Danger confirm').click();
    await fixture.whenStable();

    document.querySelector<HTMLButtonElement>('[role="alertdialog"] button')?.click();
    await fixture.whenStable();

    expect(host.textContent).toContain('Delete task: cancelled.');
  });
});
