export const WORKSPACE_URL_SUFFIX = '.collabspace.app';
export const WORKSPACE_NAME_MAX_LENGTH = 50;
export const WORKSPACE_SLUG_MAX_LENGTH = 40;
export const WORKSPACE_DESCRIPTION_MAX_LENGTH = 160;

const NAME_MIN_LENGTH = 2;
const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'app',
  'www',
  'admin',
  'api',
  'help',
  'status',
  'collabspace',
]);
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, WORKSPACE_SLUG_MAX_LENGTH);

export const cleanSlugInput = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, WORKSPACE_SLUG_MAX_LENGTH);

export const workspaceUrlOf = (slug: string): string => `${slug}${WORKSPACE_URL_SUFFIX}`;

export const workspaceNameError = (name: string): string =>
  name.trim().length < NAME_MIN_LENGTH ? 'Give the workspace a name.' : '';

export const workspaceSlugError = (slug: string, isTaken: (slug: string) => boolean): string => {
  if (!slug) {
    return 'Choose an address for the workspace.';
  }
  if (!SLUG_PATTERN.test(slug)) {
    return 'Use 3–40 lowercase letters, numbers or hyphens, starting and ending with a letter or number.';
  }
  if (RESERVED_SLUGS.has(slug) || isTaken(slug)) {
    return `${workspaceUrlOf(slug)} is taken — try another.`;
  }
  return '';
};
