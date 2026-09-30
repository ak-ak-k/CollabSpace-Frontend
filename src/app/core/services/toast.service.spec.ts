import { TestBed } from '@angular/core/testing';
import { DEFAULT_TOAST_DURATION_MS, MAX_VISIBLE_TOASTS, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast with the default icon', () => {
    const id = service.show('Link copied');

    expect(service.toasts()).toEqual([
      expect.objectContaining({ id, message: 'Link copied', icon: 'circle-check' }),
    ]);
  });

  it('keeps only the latest three toasts', () => {
    ['One', 'Two', 'Three', 'Four'].forEach((message) => service.show(message));

    expect(service.toasts().length).toBe(MAX_VISIBLE_TOASTS);
    expect(service.toasts().map((toast) => toast.message)).toEqual(['Two', 'Three', 'Four']);
  });

  it('dismisses automatically after the default duration', () => {
    service.show('Saved');

    vi.advanceTimersByTime(DEFAULT_TOAST_DURATION_MS - 1);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('dismisses on request and clears the pending timer', () => {
    const id = service.show('Saved');

    service.dismiss(id);

    expect(service.toasts().length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('runs the action and then dismisses the toast', () => {
    const onAction = vi.fn();
    const id = service.show('Task deleted', { actionLabel: 'Undo', onAction });

    service.runAction(id);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(service.toasts().length).toBe(0);
  });
});
