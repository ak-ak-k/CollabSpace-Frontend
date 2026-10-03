import { WorkspaceRole } from '../../../core/models/user';
import { formatFileSize } from '../../../shared/pipes/file-size.pipe';

const MILLISECONDS_PER_DAY = 86_400_000;
const INVITE_LIFETIME_DAYS = 7;
const MAX_LOGO_BYTES = 2 * 1_048_576;
const DOMAIN_SEPARATORS = /[\s,;]+/;
const LEADING_AT = /^@/;
const IMAGE_TYPE = /^image\//;

export const LOGO_TYPE_ERROR = 'Choose a PNG, JPG, WebP or SVG image';

export const readOnlyNoteOf = (role: WorkspaceRole, workspaceName: string): string =>
  `You’re a ${role === 'member' ? 'member' : 'guest'} of ${workspaceName}. Only owners and admins can change these settings — you can still view them.`;

export const ownerOnlyNoteOf = (workspaceName: string): string =>
  `Only workspace owners can archive or delete ${workspaceName}.`;

export const inviteExpiryOf = (invitedAt: number, now: number): string => {
  const expiresAt = invitedAt + INVITE_LIFETIME_DAYS * MILLISECONDS_PER_DAY;
  const daysLeft = Math.ceil((expiresAt - now) / MILLISECONDS_PER_DAY);
  if (daysLeft <= 0) {
    return 'Expired';
  }
  return daysLeft === 1 ? 'Expires tomorrow' : `Expires in ${daysLeft} days`;
};

export const parseDomains = (text: string): readonly string[] =>
  text
    .split(DOMAIN_SEPARATORS)
    .map((domain) => domain.replace(LEADING_AT, '').toLowerCase())
    .filter((domain) => domain !== '');

export const logoFileErrorOf = (type: string, bytes: number): string => {
  if (!IMAGE_TYPE.test(type)) {
    return LOGO_TYPE_ERROR;
  }
  return bytes > MAX_LOGO_BYTES
    ? `That image is ${formatFileSize(bytes)} — logos must be 2 MB or smaller`
    : '';
};
