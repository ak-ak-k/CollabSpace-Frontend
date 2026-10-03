export const MAX_EMAIL_ROWS = 30;

const TOKEN_SEPARATOR = /[\s,;<>]+/;
const MAILTO_PREFIX = /^mailto:/i;
const SEPARATOR_INSIDE = /[,;\s]/;
const SEPARATOR_AT_END = /[,;]$/;
const BREAK_AT_END = /[,;\s]$/;

export interface EmailRow {
  readonly id: number;
  readonly value: string;
}

export interface RowsEdit {
  readonly rows: readonly EmailRow[];
  readonly focusId: number | null;
}

export const splitEmailText = (raw: string): string[] =>
  raw
    .split(TOKEN_SEPARATOR)
    .map((token) => token.replace(MAILTO_PREFIX, ''))
    .filter(Boolean);

export const nextRowId = (rows: readonly EmailRow[]): number =>
  rows.reduce((highest, row) => Math.max(highest, row.id), 0) + 1;

export const freshRows = (rows: readonly EmailRow[] = []): readonly EmailRow[] => [
  { id: nextRowId(rows), value: '' },
];

const unchanged = (rows: readonly EmailRow[]): RowsEdit => ({ rows, focusId: null });

export const splitRow = (
  rows: readonly EmailRow[],
  id: number,
  raw: string,
  keepEmpty: boolean,
): RowsEdit => {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) {
    return unchanged(rows);
  }
  let nextId = nextRowId(rows);
  const tokens = splitEmailText(raw);
  const replacements: EmailRow[] = tokens.length
    ? tokens.map((value, position) => (position === 0 ? { id, value } : { id: nextId++, value }))
    : [{ id, value: '' }];
  if (keepEmpty && rows.length + replacements.length <= MAX_EMAIL_ROWS) {
    replacements.push({ id: nextId, value: '' });
  }
  const next = [...rows.slice(0, index), ...replacements, ...rows.slice(index + 1)].slice(
    0,
    MAX_EMAIL_ROWS,
  );
  const wanted = replacements[replacements.length - 1]?.id;
  const focusId = next.some((row) => row.id === wanted) ? wanted : (next.at(-1)?.id ?? null);
  return { rows: next, focusId: focusId ?? null };
};

export const typedRowEdit = (rows: readonly EmailRow[], id: number, value: string): RowsEdit =>
  SEPARATOR_INSIDE.test(value.trim()) || SEPARATOR_AT_END.test(value)
    ? splitRow(rows, id, value, BREAK_AT_END.test(value))
    : unchanged(rows.map((row) => (row.id === id ? { ...row, value } : row)));

export const pastedRowEdit = (
  rows: readonly EmailRow[],
  id: number,
  pasted: string,
): RowsEdit | null => {
  const current = rows.find((row) => row.id === id);
  if (!current || !SEPARATOR_INSIDE.test(pasted.trim())) {
    return null;
  }
  return splitRow(rows, id, `${current.value} ${pasted}`.trim(), true);
};

export const withoutRow = (rows: readonly EmailRow[], id: number): RowsEdit => {
  const index = rows.findIndex((row) => row.id === id);
  const neighbour = rows[index + 1] ?? rows[index - 1];
  return { rows: rows.filter((row) => row.id !== id), focusId: neighbour?.id ?? null };
};

export const withoutEmptyRow = (rows: readonly EmailRow[], id: number): RowsEdit => {
  const index = rows.findIndex((row) => row.id === id);
  const previous = index > 0 ? rows[index - 1] : rows[1];
  return { rows: rows.filter((row) => row.id !== id), focusId: previous?.id ?? null };
};

export const withNewRow = (rows: readonly EmailRow[]): RowsEdit => {
  if (rows.length >= MAX_EMAIL_ROWS) {
    return unchanged(rows);
  }
  const added = { id: nextRowId(rows), value: '' };
  return { rows: [...rows, added], focusId: added.id };
};
