const NEXT_KEYS = new Set(['ArrowDown', 'ArrowRight']);
const PREVIOUS_KEYS = new Set(['ArrowUp', 'ArrowLeft']);

export const menuKeyTarget = (key: string, index: number, count: number): number | null => {
  if (count === 0) {
    return null;
  }
  if (NEXT_KEYS.has(key)) {
    return (index + 1) % count;
  }
  if (PREVIOUS_KEYS.has(key)) {
    return index <= 0 ? count - 1 : index - 1;
  }
  if (key === 'Home') {
    return 0;
  }
  return key === 'End' ? count - 1 : null;
};
