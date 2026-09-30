import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../../core/services/toast.service';
import { ToastRegionComponent } from './toast-region.component';

describe('ToastRegionComponent', () => {
  let fixture: ComponentFixture<ToastRegionComponent>;
  let host: HTMLElement;
  let toasts: ToastService;

  const rendered = () => Array.from(host.querySelectorAll<HTMLElement>('[role="status"]'));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastRegionComponent);
    host = fixture.nativeElement as HTMLElement;
    toasts = TestBed.inject(ToastService);
  });

  afterEach(() => {
    toasts.toasts().forEach((toast) => toasts.dismiss(toast.id));
  });

  it('is a polite notifications region', async () => {
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-label')).toBe('Notifications');
    expect(host.getAttribute('aria-live')).toBe('polite');
    expect(rendered()).toEqual([]);
  });

  it('renders every toast held by the service', async () => {
    toasts.show('Link copied');
    toasts.show('Task deleted', { actionLabel: 'Undo', onAction: () => undefined });
    await fixture.whenStable();

    expect(rendered().map((toast) => toast.querySelector('.toast__message')?.textContent)).toEqual([
      'Link copied',
      'Task deleted',
    ]);
    expect(rendered()[0].querySelector('.toast__action')).toBeNull();
    expect(rendered()[1].querySelector('.toast__action')?.textContent?.trim()).toBe('Undo');
  });

  it('runs the action and dismisses from the buttons', async () => {
    const onAction = vi.fn();
    toasts.show('Task deleted', { actionLabel: 'Undo', onAction });
    toasts.show('Link copied');
    await fixture.whenStable();

    rendered()[0].querySelector<HTMLButtonElement>('.toast__action')?.click();
    rendered()[1].querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]')?.click();
    await fixture.whenStable();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(rendered()).toEqual([]);
  });
});
