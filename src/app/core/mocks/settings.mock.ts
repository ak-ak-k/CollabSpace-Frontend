import { DeviceSession, Integration, Preferences } from '../models/preferences';

export const MOCK_PREFERENCES: Preferences = {
  notifications: {
    mentions: { inapp: true, push: true, email: true },
    dms: { inapp: true, push: true, email: false },
    threads: { inapp: true, push: false, email: false },
    tasks: { inapp: true, push: false, email: true },
    due: { inapp: true, push: true, email: false },
    team: { inapp: true, push: false, email: false },
    system: { inapp: true, push: true, email: true },
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
