export type SkeletonLayout = 'list' | 'cards' | 'board' | 'table' | 'chat' | 'detail';
export type SkeletonArrangement = 'rows' | 'cards' | 'board' | 'detail';
export type SkeletonBarHeight = 'sm' | 'md' | 'lg' | 'xl';
export type SkeletonBlockSize = 'sm' | 'md' | 'lg';

export interface SkeletonBar {
  readonly widthPercent: number;
  readonly height: SkeletonBarHeight;
}

export interface SkeletonItem {
  readonly block: SkeletonBlockSize | null;
  readonly bars: readonly SkeletonBar[];
}

export interface SkeletonSection {
  readonly header: SkeletonBar | null;
  readonly items: readonly SkeletonItem[];
}

export interface SkeletonView {
  readonly arrangement: SkeletonArrangement;
  readonly sections: readonly SkeletonSection[];
}

const CARD_COUNT = 6;
const BOARD_CARDS_PER_COLUMN: readonly number[] = [3, 2, 3, 2, 3];

const bar = (widthPercent: number, height: SkeletonBarHeight): SkeletonBar => ({
  widthPercent,
  height,
});

const lines = (widthPercents: readonly number[]): readonly SkeletonBar[] =>
  widthPercents.map((widthPercent, index) => bar(widthPercent, index === 0 ? 'md' : 'sm'));

const repeat = <Item>(count: number, create: (index: number) => Item): readonly Item[] =>
  Array.from({ length: Math.max(count, 0) }, (_unused, index) => create(index));

const LIST_ROW: SkeletonItem = { block: 'md', bars: lines([45, 80]) };
const TABLE_ROW: SkeletonItem = { block: 'sm', bars: lines([50, 25]) };
const TABLE_HEADER = bar(35, 'sm');
const CHAT_ROWS: readonly SkeletonItem[] = [
  { block: 'md', bars: lines([18, 54, 38]) },
  { block: 'md', bars: lines([22, 72]) },
];
const CARD: SkeletonItem = {
  block: 'lg',
  bars: [bar(60, 'lg'), bar(90, 'sm'), bar(70, 'sm')],
};
const BOARD_COLUMN_HEADER = bar(45, 'md');
const BOARD_CARD: SkeletonItem = {
  block: null,
  bars: [bar(30, 'sm'), bar(85, 'md'), bar(55, 'sm')],
};
const DETAIL_HEADING: SkeletonItem = { block: null, bars: [bar(40, 'xl'), bar(70, 'md')] };
const DETAIL_BODY: SkeletonItem = {
  block: null,
  bars: [bar(90, 'md'), bar(80, 'md'), bar(85, 'md'), bar(50, 'md')],
};

const section = (
  items: readonly SkeletonItem[],
  header: SkeletonBar | null = null,
): SkeletonSection => ({ header, items });

const VIEW_BUILDERS: Record<SkeletonLayout, (rows: number) => SkeletonView> = {
  list: (rows) => ({
    arrangement: 'rows',
    sections: [section(repeat(rows, () => LIST_ROW))],
  }),
  table: (rows) => ({
    arrangement: 'rows',
    sections: [
      section(
        repeat(rows, () => TABLE_ROW),
        TABLE_HEADER,
      ),
    ],
  }),
  chat: (rows) => ({
    arrangement: 'rows',
    sections: [section(repeat(rows, (index) => CHAT_ROWS[index % CHAT_ROWS.length]))],
  }),
  cards: () => ({
    arrangement: 'cards',
    sections: repeat(CARD_COUNT, () => section([CARD])),
  }),
  board: () => ({
    arrangement: 'board',
    sections: BOARD_CARDS_PER_COLUMN.map((cardCount) =>
      section(
        repeat(cardCount, () => BOARD_CARD),
        BOARD_COLUMN_HEADER,
      ),
    ),
  }),
  detail: () => ({
    arrangement: 'detail',
    sections: [section([DETAIL_HEADING]), section([DETAIL_BODY])],
  }),
};

export function buildSkeletonView(layout: SkeletonLayout, rows: number): SkeletonView {
  return VIEW_BUILDERS[layout](rows);
}
