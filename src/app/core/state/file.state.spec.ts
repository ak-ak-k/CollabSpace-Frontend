import { TestBed } from '@angular/core/testing';
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
});
