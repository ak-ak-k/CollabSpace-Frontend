import { TestBed } from '@angular/core/testing';
import { DataModeState } from './data-mode.state';
import { FileState } from './file.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';

describe('FileState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  it('loads the mock files and filters them by location', async () => {
    const files = TestBed.inject(FileState);
    await settle();

    expect(files.status()).toBe('ready');
    expect(files.files().length).toBeGreaterThan(0);
    expect(
      files.filesAt(new Set(['#releases'])).every((file) => file.location === '#releases'),
    ).toBe(true);
  });

  it('toggles the star of a file', async () => {
    const files = TestBed.inject(FileState);
    await settle();

    files.toggleStar('f2');
    expect(files.file('f2')?.starred).toBe(true);

    files.toggleStar('f2');
    expect(files.file('f2')?.starred).toBe(false);
  });

  it('removes a file and restores it at the top of the list', async () => {
    const files = TestBed.inject(FileState);
    await settle();

    const removed = files.remove('f5');
    expect(removed?.name).toBe('release-banner-v2.png');
    expect(files.file('f5')).toBeNull();
    expect(files.remove('missing')).toBeNull();

    if (removed) {
      files.restore(removed);
    }
    expect(files.files()[0]?.id).toBe('f5');
  });

  it('uploads a private file and leaves the empty state', async () => {
    TestBed.inject(DataModeState).setMode('empty');
    const files = TestBed.inject(FileState);
    await settle();
    expect(files.status()).toBe('empty');

    const uploaded = await files.upload('notes.md');

    expect(uploaded).toMatchObject({ name: 'notes.md', type: 'code', location: 'Only you' });
    expect(files.files()[0]).toBe(uploaded);
    expect(files.status()).toBe('ready');
  });

  it('renames a file and returns the previous version for undo', async () => {
    const files = TestBed.inject(FileState);
    await settle();

    const previous = files.rename('f1', 'Q4 Roadmap final.pdf');

    expect(previous?.name).toBe('Q4 Roadmap.pdf');
    expect(files.file('f1')?.name).toBe('Q4 Roadmap final.pdf');
    expect(files.file('f1')?.modifiedAt).toBeGreaterThanOrEqual(previous?.modifiedAt ?? 0);
  });

  it('attaches files to tasks and finds files shared in conversations', async () => {
    const files = TestBed.inject(FileState);
    await settle();

    const attached = await files.attachToTask('NS-150', {
      name: 'trace.json',
      sizeLabel: '4 KB',
      bytes: 4000,
    });
    expect(attached).toMatchObject({ source: { type: 'task', taskId: 'NS-150' }, ownerId: 'u0' });
    expect(files.filesByIds([attached.id, 'missing', 'f2']).map((file) => file.id)).toEqual([
      attached.id,
      'f2',
    ]);

    files.detachFromTask(attached.id, 'NS-150');
    expect(files.file(attached.id)?.taskIds).toEqual([]);
    expect(files.fileForAttachment('c-frontend', 'Design QA — 2.4.pdf')?.id).toBe('f6');
  });
});
