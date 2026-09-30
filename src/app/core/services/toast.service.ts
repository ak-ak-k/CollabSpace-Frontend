import { Service, Signal, signal } from '@angular/core';
import { IconName } from '../../shared/ui/icon/icon-registry';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly icon: IconName;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export interface ToastOptions {
  readonly icon?: IconName;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly duration?: number;
}

export const DEFAULT_TOAST_ICON: IconName = 'circle-check';
export const DEFAULT_TOAST_DURATION_MS = 4500;
export const MAX_VISIBLE_TOASTS = 3;

type DismissTimer = ReturnType<typeof setTimeout>;

@Service()
export class ToastService {
  private readonly visibleToasts = signal<readonly Toast[]>([]);
  private readonly dismissTimers = new Map<string, DismissTimer>();
  private lastSequence = 0;

  readonly toasts: Signal<readonly Toast[]> = this.visibleToasts.asReadonly();

  show(message: string, options: ToastOptions = {}): string {
    const toast = this.createToast(message, options);
    this.visibleToasts.update((toasts) => [...toasts, toast]);
    this.dismissOverflow();
    this.scheduleDismiss(toast.id, options.duration ?? DEFAULT_TOAST_DURATION_MS);
    return toast.id;
  }

  dismiss(id: string): void {
    this.clearDismissTimer(id);
    this.visibleToasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  runAction(id: string): void {
    const toast = this.visibleToasts().find((candidate) => candidate.id === id);
    toast?.onAction?.();
    this.dismiss(id);
  }

  private createToast(message: string, options: ToastOptions): Toast {
    this.lastSequence += 1;
    return {
      id: `toast-${this.lastSequence}`,
      message,
      icon: options.icon ?? DEFAULT_TOAST_ICON,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    };
  }

  private dismissOverflow(): void {
    const overflow = this.visibleToasts().slice(0, -MAX_VISIBLE_TOASTS);
    overflow.forEach((toast) => this.dismiss(toast.id));
  }

  private scheduleDismiss(id: string, duration: number): void {
    this.dismissTimers.set(
      id,
      setTimeout(() => this.dismiss(id), duration),
    );
  }

  private clearDismissTimer(id: string): void {
    clearTimeout(this.dismissTimers.get(id));
    this.dismissTimers.delete(id);
  }
}
