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
});
