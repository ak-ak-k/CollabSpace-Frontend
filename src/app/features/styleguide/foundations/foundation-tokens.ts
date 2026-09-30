export interface ColorGroup {
  readonly title: string;
  readonly tokens: readonly string[];
}

export interface TextSample {
  readonly label: string;
  readonly token: string;
}

const RAMP_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const ramp = (name: string): string[] => RAMP_STEPS.map((step) => `--color-${name}-${step}`);

export const COLOR_GROUPS: readonly ColorGroup[] = [
  {
    title: 'Surfaces and borders',
    tokens: [
      '--background',
      '--surface',
      '--surface-secondary',
      '--selected',
      '--border',
      '--border-control',
    ],
  },
  {
    title: 'Brand and actions',
    tokens: [
      '--brand',
      '--primary',
      '--primary-hover',
      '--primary-active',
      '--secondary',
      '--danger',
      '--danger-surface',
    ],
  },
  { title: 'Status', tokens: ['--success', '--warning', '--info'] },
  { title: 'Rail', tokens: ['--rail-background', '--rail-foreground', '--rail-muted'] },
  { title: 'Neutral ramp', tokens: ramp('neutral') },
  { title: 'Accent ramp', tokens: ramp('accent') },
];

export const TEXT_COLORS: readonly TextSample[] = [
  { label: 'Primary text', token: '--text-primary' },
  { label: 'Secondary text', token: '--text-secondary' },
  { label: 'Muted text', token: '--text-muted' },
  { label: 'Danger text', token: '--danger' },
  { label: 'Success text', token: '--success-text' },
  { label: 'Warning text', token: '--warning-text' },
  { label: 'Info text', token: '--info-text' },
];

export const FONT_SIZES: readonly string[] = [
  '--font-size-10',
  '--font-size-11',
  '--font-size-12',
  '--font-size-13',
  '--font-size-14',
  '--font-size-15',
  '--font-size-16',
  '--font-size-17',
  '--font-size-18',
  '--font-size-20',
  '--font-size-22',
  '--font-size-25',
  '--font-size-28',
  '--font-size-32',
  '--font-size-42',
];

export const SPACING: readonly string[] = [
  '--space-0-5',
  '--space-1',
  '--space-1-5',
  '--space-2',
  '--space-2-5',
  '--space-3',
  '--space-3-5',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-8',
  '--space-10',
  '--space-12',
  '--space-14',
  '--space-16',
];

export const SHADOWS: readonly string[] = ['--shadow-sm', '--shadow-md', '--shadow-lg'];

export const cssVariable = (token: string): string => `var(${token})`;
