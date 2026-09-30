let lastSequence = 0;

export function createUniqueId(prefix: string): string {
  lastSequence += 1;
  return `${prefix}-${lastSequence}`;
}

export function joinIds(...ids: readonly (string | null)[]): string | null {
  const renderedIds = ids.filter((id) => id !== null);
  return renderedIds.length > 0 ? renderedIds.join(' ') : null;
}
