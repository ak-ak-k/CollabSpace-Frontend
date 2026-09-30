import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('formats bytes, kilobytes and megabytes', () => {
    expect(pipe.transform(512)).toBe('512 B');
    expect(pipe.transform(12_000)).toBe('12 KB');
    expect(pipe.transform(2_400_000)).toBe('2.3 MB');
  });

  it('returns an empty string without a size', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
