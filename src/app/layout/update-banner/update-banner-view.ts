import { ConfirmOptions } from '../../core/services/dialog.service';

export type ReloadStep = 'finish-syncing' | 'confirm' | 'reload';

export interface ReloadContext {
  readonly pendingChanges: number;
  readonly unsentText: boolean;
  readonly dialogOpen: boolean;
}

export const RELOAD_CONFIRM: ConfirmOptions = {
  title: 'Reload CollabSpace now?',
  body: 'You have text that hasn’t been sent or saved. Reloading clears it — finish or copy it first, or choose Later.',
  confirmLabel: 'Reload anyway',
  icon: 'refresh-cw',
  tone: 'neutral',
};

export const SIMULATED_UPDATE_MESSAGE =
  'Simulated update — the installed app would reload onto the new version now';

const TEXT_FIELD_SELECTOR =
  'textarea, input:not([type]), input[type="text"], input[type="email"], [contenteditable="true"]';
const OPEN_DIALOG_SELECTOR = '[aria-modal="true"]';

const changesLabel = (count: number): string => `${count} ${count === 1 ? 'change' : 'changes'}`;

export const updateHintOf = (pendingChanges: number): string =>
  pendingChanges > 0
    ? `Reload after your ${changesLabel(pendingChanges)} finish syncing.`
    : 'Reload when you’re ready to switch to it.';

export const finishSyncingMessageOf = (pendingChanges: number): string =>
  `Finish syncing first — ${pendingChanges} ${pendingChanges === 1 ? 'change is' : 'changes are'} still waiting on this device`;

export const reloadStepOf = (context: ReloadContext): ReloadStep => {
  if (context.pendingChanges > 0) {
    return 'finish-syncing';
  }
  return context.unsentText || context.dialogOpen ? 'confirm' : 'reload';
};

const holdsText = (field: Element): boolean => {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return !field.readOnly && !field.disabled && field.value.trim() !== '';
  }
  return (field.textContent ?? '').trim() !== '';
};

export const hasUnsentText = (root: ParentNode): boolean =>
  Array.from(root.querySelectorAll(TEXT_FIELD_SELECTOR)).some(holdsText);

export const hasOpenDialog = (root: ParentNode): boolean =>
  root.querySelector(OPEN_DIALOG_SELECTOR) !== null;
