export type PasswordStrengthLabel = 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
export type PasswordStrengthTone = 'danger' | 'warning' | 'success';

export interface PasswordStrength {
  readonly score: number;
  readonly label: PasswordStrengthLabel;
  readonly tip: string;
  readonly tone: PasswordStrengthTone;
}

interface StrengthCriterion {
  readonly tip: string;
  readonly isMet: (password: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_LONG_LENGTH = 14;
export const PASSWORD_STRENGTH_MAX_SCORE = 4;

const COMPLETE_TIP = 'nice';
const WARNING_SCORE = 2;
const LABELS: readonly PasswordStrengthLabel[] = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

const hasMinimumLength = (password: string): boolean => password.length >= PASSWORD_MIN_LENGTH;

const CRITERIA: readonly StrengthCriterion[] = [
  { tip: 'use 8 or more characters', isMet: hasMinimumLength },
  {
    tip: 'mix upper and lower case',
    isMet: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  { tip: 'add a number', isMet: (password) => /\d/.test(password) },
  {
    tip: 'add a symbol or make it longer',
    isMet: (password) => /[^A-Za-z0-9]/.test(password) || password.length >= PASSWORD_LONG_LENGTH,
  },
];

function toneForScore(score: number): PasswordStrengthTone {
  if (score < WARNING_SCORE) {
    return 'danger';
  }
  return score === WARNING_SCORE ? 'warning' : 'success';
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const metCount = CRITERIA.filter((criterion) => criterion.isMet(password)).length;
  const score = hasMinimumLength(password) ? metCount : 0;
  const firstMissing = CRITERIA.find((criterion) => !criterion.isMet(password));

  return {
    score,
    label: LABELS[score],
    tip: firstMissing?.tip ?? COMPLETE_TIP,
    tone: toneForScore(score),
  };
}
