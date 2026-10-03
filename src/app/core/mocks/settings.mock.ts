import { DeviceSession, Integration, Preferences, RolePermission } from '../models/preferences';

export const MOCK_PREFERENCES: Preferences = {
  notifications: {
    mentions: { desktop: true, mobile: true, email: true },
    dms: { desktop: true, mobile: true, email: false },
    tasks: { desktop: true, mobile: false, email: true },
    team: { desktop: false, mobile: false, email: false },
    system: { desktop: true, mobile: true, email: true },
  },
  sounds: true,
  doNotDisturb: false,
  showStatus: true,
  readReceipts: true,
  typingIndicators: true,
  profileVisibility: 'Everyone in the workspace',
  twoFactor: true,
  density: 'comfortable',
  language: 'English (India)',
  timeFormat: '12-hour',
  weekStart: 'Monday',
  reduceMotion: false,
  enterToSend: true,
  statusMessage: 'Heads-down on the 2.4 release',
  displayName: 'Aarav',
  pronouns: 'he/him',
};

export const MOCK_SESSIONS: readonly DeviceSession[] = [
  {
    id: 's1',
    device: 'MacBook Pro · Chrome 129',
    icon: 'laptop',
    location: 'Bengaluru, India',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 's2',
    device: 'iPhone 15 · CollabSpace for iOS',
    icon: 'smartphone',
    location: 'Bengaluru, India',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 's3',
    device: 'Windows · Edge 128',
    icon: 'monitor',
    location: 'Mumbai, India',
    lastActive: '2 days ago',
    current: false,
  },
];

export const MOCK_INTEGRATIONS: readonly Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    description: 'Link pull requests and commits to tasks.',
    connected: true,
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: 'figma',
    description: 'Preview design files inline in messages.',
    connected: true,
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: 'hard-drive',
    description: 'Share Drive files with channels and DMs.',
    connected: false,
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: 'calendar',
    description: 'Sync meetings to your status automatically.',
    connected: false,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: 'video',
    description: 'Start a call from any conversation.',
    connected: false,
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: 'layers',
    description: 'Import issues into CollabSpace tasks.',
    connected: false,
  },
];

export const MOCK_ROLE_NAMES: readonly string[] = ['Owner', 'Admin', 'Member', 'Guest'];

export const MOCK_ROLE_PERMISSIONS: readonly RolePermission[] = [
  { label: 'Manage workspace settings and billing', allowed: [true, false, false, false] },
  { label: 'Manage members and roles', allowed: [true, true, false, false] },
  { label: 'Create teams', allowed: [true, true, true, false] },
  { label: 'Create public channels', allowed: [true, true, true, false] },
  { label: 'Invite members', allowed: [true, true, true, false] },
  { label: 'Delete any message', allowed: [true, true, false, false] },
  { label: 'Join public channels', allowed: [true, true, true, false] },
  { label: 'Post in channels they’re added to', allowed: [true, true, true, true] },
];
