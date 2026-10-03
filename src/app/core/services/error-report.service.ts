import { Service, signal } from '@angular/core';

const REFERENCE_PREFIX = 'CS';
const HEX_RADIX = 16;
const REFERENCE_GROUP_LENGTH = 4;

const referenceGroup = (value: number): string =>
  value.toString(HEX_RADIX).toUpperCase().padStart(REFERENCE_GROUP_LENGTH, '0');

const createReference = (): string => {
  const [first, second] = crypto.getRandomValues(new Uint16Array(2));
  return [REFERENCE_PREFIX, referenceGroup(first), referenceGroup(second)].join('-');
};

@Service()
export class ErrorReportService {
  private readonly latest = signal<string | null>(null);

  readonly reference = this.latest.asReadonly();

  report(): string {
    const reference = createReference();
    this.latest.set(reference);
    return reference;
  }

  clear(): void {
    this.latest.set(null);
  }
}
