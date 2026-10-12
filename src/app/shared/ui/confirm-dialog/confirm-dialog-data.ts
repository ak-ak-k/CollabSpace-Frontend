import { IconName } from '../icon/icon-registry';

export type ConfirmTone = 'danger' | 'neutral';

export interface ConfirmOptions {
  readonly title: string;
  readonly body: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly icon?: IconName;
  readonly tone?: ConfirmTone;
  readonly confirmText?: string;
  readonly canConfirm?: () => boolean;
}

export type ConfirmDialogData = Required<ConfirmOptions>;

const DEFAULT_CONFIRM_LABEL = 'Confirm';
const DEFAULT_CANCEL_LABEL = 'Cancel';
const DEFAULT_TONE: ConfirmTone = 'danger';
const ALWAYS_CONFIRMABLE = (): boolean => true;
const DEFAULT_ICONS: Record<ConfirmTone, IconName> = {
  danger: 'triangle-alert',
  neutral: 'circle-help',
};

export function resolveConfirmData(options: ConfirmOptions): ConfirmDialogData {
  const tone = options.tone ?? DEFAULT_TONE;
  return {
    title: options.title,
    body: options.body,
    confirmLabel: options.confirmLabel ?? DEFAULT_CONFIRM_LABEL,
    cancelLabel: options.cancelLabel ?? DEFAULT_CANCEL_LABEL,
    icon: options.icon ?? DEFAULT_ICONS[tone],
    tone,
    confirmText: options.confirmText ?? '',
    canConfirm: options.canConfirm ?? ALWAYS_CONFIRMABLE,
  };
}

export function confirmTitleId(dialogId: string): string {
  return `${dialogId}-title`;
}

export function confirmBodyId(dialogId: string): string {
  return `${dialogId}-body`;
}

export function confirmTypeId(dialogId: string): string {
  return `${dialogId}-type`;
}
