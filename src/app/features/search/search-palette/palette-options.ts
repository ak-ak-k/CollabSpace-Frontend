import { SearchGroup, SearchGroupKey, SearchResult } from '../../../core/data/search.data';
import { PaletteCommand } from './palette-commands';

export const LISTBOX_ID = 'search-palette-listbox';
export const RECENT_SEARCHES_SHOWN = 4;

const OPTION_ID_PREFIX = 'search-palette-option-';
const HEADING_ID_PREFIX = 'search-palette-heading-';
const HEADING_ROWS = 1;
const FIRST_ROW = 1;

export type SectionKind = 'recent' | 'commands' | 'results';

export type PaletteEntry =
  | { readonly type: 'recent'; readonly query: string }
  | { readonly type: 'command'; readonly command: PaletteCommand }
  | { readonly type: 'result'; readonly result: SearchResult };

interface Placement {
  readonly id: string;
  readonly index: number;
  readonly row: number;
}

export type PaletteOption = PaletteEntry & Placement;

export interface SectionDraft {
  readonly key: string;
  readonly kind: SectionKind;
  readonly label: string;
  readonly total: number | null;
  readonly expandKey: SearchGroupKey | null;
  readonly entries: readonly PaletteEntry[];
}

export interface PaletteSection extends Omit<SectionDraft, 'entries'> {
  readonly headingId: string;
  readonly row: number;
  readonly rowSpan: number;
  readonly options: readonly PaletteOption[];
}

export const idleDrafts = (
  recentSearches: readonly string[],
  commands: readonly PaletteCommand[],
): SectionDraft[] => [
  {
    key: 'recent',
    kind: 'recent',
    label: 'Recent searches',
    total: null,
    expandKey: null,
    entries: recentSearches
      .slice(0, RECENT_SEARCHES_SHOWN)
      .map((query): PaletteEntry => ({ type: 'recent', query })),
  },
  {
    key: 'commands',
    kind: 'commands',
    label: 'Jump to',
    total: null,
    expandKey: null,
    entries: commands.map((command): PaletteEntry => ({ type: 'command', command })),
  },
];

export const resultDrafts = (groups: readonly SearchGroup[]): SectionDraft[] =>
  groups.map((group) => ({
    key: group.key,
    kind: 'results',
    label: group.label,
    total: group.total,
    expandKey: group.hasMore ? group.key : null,
    entries: group.items.map((result): PaletteEntry => ({ type: 'result', result })),
  }));

const placeSection = (
  draft: SectionDraft,
  firstIndex: number,
  headingRow: number,
): PaletteSection => {
  const { entries, ...section } = draft;
  return {
    ...section,
    headingId: `${HEADING_ID_PREFIX}${draft.key}`,
    row: headingRow,
    rowSpan: entries.length + HEADING_ROWS,
    options: entries.map((entry, offset) => ({
      ...entry,
      id: `${OPTION_ID_PREFIX}${firstIndex + offset}`,
      index: firstIndex + offset,
      row: headingRow + HEADING_ROWS + offset,
    })),
  };
};

export const optionsOf = (sections: readonly PaletteSection[]): readonly PaletteOption[] =>
  sections.flatMap((section) => section.options);

export const rowCountOf = (sections: readonly PaletteSection[]): number =>
  sections.reduce((rows, section) => rows + section.rowSpan, 0);

export const layOutSections = (drafts: readonly SectionDraft[]): PaletteSection[] =>
  drafts
    .filter((draft) => draft.entries.length > 0)
    .reduce<PaletteSection[]>(
      (placed, draft) => [
        ...placed,
        placeSection(draft, optionsOf(placed).length, FIRST_ROW + rowCountOf(placed)),
      ],
      [],
    );
