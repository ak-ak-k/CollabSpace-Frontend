let lastSequence = 0;

export function createOverlayId(prefix: string): string {
  lastSequence += 1;
  return `${prefix}-${lastSequence}`;
}
