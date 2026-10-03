import { Router } from '@angular/router';

const RETURN_SECTION_KEY = 'settingsReturnSection';

export type SettingsReturnState = Readonly<Record<typeof RETURN_SECTION_KEY, string>>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null;

export const returnStateOf = (sectionId: string): SettingsReturnState => ({
  [RETURN_SECTION_KEY]: sectionId,
});

export const returnSectionOf = (router: Router): string | null => {
  const state: unknown = router.currentNavigation()?.extras.state;
  const section = isRecord(state) ? state[RETURN_SECTION_KEY] : null;
  return typeof section === 'string' ? section : null;
};

export const isInAppNavigation = (router: Router): boolean =>
  (router.currentNavigation()?.previousNavigation ?? null) !== null;
