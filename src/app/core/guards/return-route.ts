const APP_SECTIONS: ReadonlySet<string> = new Set([
  'home',
  'workspace',
  'people',
  'activity',
  'messages',
  'teams',
  'tasks',
  'files',
  'notifications',
  'profile',
  'settings',
]);

const FIRST_SEGMENT = /^\/([a-z][a-z-]*)(?:[/?#]|$)/;

export const isReturnableRoute = (url: string | null | undefined): url is string => {
  const section = url ? FIRST_SEGMENT.exec(url)?.[1] : undefined;
  return !!section && APP_SECTIONS.has(section);
};

export const returnRouteOf = (stored: string | null | undefined): string | null =>
  isReturnableRoute(stored) ? stored : null;
