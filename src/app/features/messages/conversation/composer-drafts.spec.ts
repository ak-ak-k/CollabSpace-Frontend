import { threadKey } from '../../../core/models/thread';
import { ComposerDrafts } from './composer-drafts';

describe('ComposerDrafts', () => {
  it('keeps a separate draft for the conversation and each of its threads', () => {
    const drafts = new ComposerDrafts();
    const thread = threadKey('g-launch', 'g-launch-0');

    drafts.setText('g-launch', 'Main draft');
    drafts.setText(thread, 'Thread draft');
    drafts.clear(thread);

    expect(drafts.text('g-launch')).toBe('Main draft');
    expect(drafts.text(thread)).toBe('');
    expect(drafts.text(threadKey('g-launch', 'other'))).toBe('');
  });
});
