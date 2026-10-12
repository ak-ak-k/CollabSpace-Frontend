import {
  finishSyncingMessageOf,
  hasOpenDialog,
  hasUnsentText,
  reloadStepOf,
  updateHintOf,
} from './update-banner-view';

const pageWith = (markup: string): HTMLElement => {
  const page = document.createElement('div');
  page.innerHTML = markup;
  return page;
};

const field = (tag: 'input' | 'textarea', value: string, attributes: Record<string, string>) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([name, text]) => element.setAttribute(name, text));
  element.value = value;
  return element;
};

const pageOf = (...fields: HTMLElement[]): HTMLElement => {
  const page = document.createElement('div');
  page.append(...fields);
  return page;
};

describe('update banner view', () => {
  it('explains when to reload, counting changes still waiting to sync', () => {
    expect(updateHintOf(0)).toBe('Reload when you’re ready to switch to it.');
    expect(updateHintOf(1)).toBe('Reload after your 1 change finish syncing.');
    expect(updateHintOf(3)).toBe('Reload after your 3 changes finish syncing.');
    expect(finishSyncingMessageOf(1)).toBe(
      'Finish syncing first — 1 change is still waiting on this device',
    );
    expect(finishSyncingMessageOf(2)).toBe(
      'Finish syncing first — 2 changes are still waiting on this device',
    );
  });

  it('waits for syncing first, then asks before discarding unsent text', () => {
    const quiet = { pendingChanges: 0, unsentText: false, dialogOpen: false };

    expect(reloadStepOf({ ...quiet, pendingChanges: 2, unsentText: true })).toBe('finish-syncing');
    expect(reloadStepOf({ ...quiet, unsentText: true })).toBe('confirm');
    expect(reloadStepOf({ ...quiet, dialogOpen: true })).toBe('confirm');
    expect(reloadStepOf(quiet)).toBe('reload');
  });

  it('finds typed text in editable fields only', () => {
    const typed = pageOf(
      field('textarea', '  Draft reply ', {}),
      field('input', '', { type: 'text' }),
    );
    const ignored = pageOf(
      field('input', 'Kept', { type: 'text', readonly: '' }),
      field('input', 'Query', { type: 'search' }),
      field('textarea', '   ', {}),
    );

    expect(hasUnsentText(typed)).toBe(true);
    expect(hasUnsentText(ignored)).toBe(false);
  });

  it('notices an open modal dialog', () => {
    expect(hasOpenDialog(pageWith('<div role="dialog" aria-modal="true"></div>'))).toBe(true);
    expect(hasOpenDialog(pageWith('<div role="dialog"></div>'))).toBe(false);
  });
});
