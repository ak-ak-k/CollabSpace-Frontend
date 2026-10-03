import { Team } from '../../core/models/team';
import { User } from '../../core/models/user';
import { formatLocalTime } from '../../shared/pipes/time-format';
import { SelectOption } from '../../shared/ui/select/select.component';

export interface TimeZoneOption {
  readonly value: string;
  readonly label: string;
  readonly shortLabel: string;
}

export interface ProfileDetail {
  readonly label: string;
  readonly value: string;
  readonly link?: string;
}

export interface ProfileTeamView {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly meta: string;
}

export interface ProfileDraft {
  readonly name: string;
  readonly title: string;
  readonly bio: string;
  readonly phone: string;
  readonly location: string;
  readonly timeZone: string;
}

export const BIO_MAX_LENGTH = 280;
const EMPTY_VALUE = '—';

export const TIME_ZONES: readonly TimeZoneOption[] = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (UTC+5:30)', shortLabel: 'IST · UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore Time (UTC+8)', shortLabel: 'SGT · UTC+8' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (UTC+4)', shortLabel: 'GST · UTC+4' },
  { value: 'Europe/London', label: 'UK time (London)', shortLabel: 'UK time' },
  { value: 'America/New_York', label: 'US Eastern Time (New York)', shortLabel: 'US Eastern' },
];

export const TIME_ZONE_OPTIONS: readonly SelectOption[] = TIME_ZONES.map((zone) => ({
  value: zone.value,
  label: zone.label,
}));

export const LANGUAGE_OPTIONS: readonly SelectOption[] = [
  { value: 'English (India)', label: 'English (India)' },
  { value: 'English (US)', label: 'English (US)' },
  { value: 'हिन्दी', label: 'हिन्दी' },
  { value: 'தமிழ்', label: 'தமிழ்' },
];

export const timeZoneOf = (value: string): TimeZoneOption | null =>
  TIME_ZONES.find((zone) => zone.value === value) ?? null;

export const draftOf = (user: User): ProfileDraft => ({
  name: user.name,
  title: user.title,
  bio: user.bio ?? '',
  phone: user.phone ?? '',
  location: user.location,
  timeZone: user.timeZone,
});

export const profileDetails = (
  user: User,
  manager: User | null,
  twentyFourHour: boolean,
): ProfileDetail[] => [
  { label: 'Email', value: user.email, link: `mailto:${user.email}` },
  { label: 'Phone', value: user.phone || EMPTY_VALUE },
  { label: 'Location', value: user.location },
  { label: 'Timezone', value: timeZoneOf(user.timeZone)?.label ?? user.timeZoneLabel },
  { label: 'Local time', value: formatLocalTime(user.timeZone, Date.now(), twentyFourHour) },
  { label: 'Department', value: user.department },
  { label: 'Manager', value: manager ? `${manager.name} · ${manager.title}` : EMPTY_VALUE },
  { label: 'Member since', value: user.joinedLabel ?? EMPTY_VALUE },
];

export const profileTeams = (teams: readonly Team[], userId: string): ProfileTeamView[] =>
  teams.map((team) => ({
    id: team.id,
    name: team.name,
    code: team.code,
    meta: `${team.leadId === userId ? 'Lead' : 'Member'} · ${team.memberIds.length} members`,
  }));
