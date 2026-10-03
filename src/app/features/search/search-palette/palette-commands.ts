import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import { PRESENCE_LABELS, User } from '../../../core/models/user';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export type CommandAction =
  | { readonly type: 'navigate'; readonly path: string }
  | { readonly type: 'create-task' }
  | { readonly type: 'invite-people' }
  | { readonly type: 'toggle-theme' };

export interface PaletteCommand {
  readonly label: string;
  readonly icon: IconName;
  readonly hint: string;
  readonly action: CommandAction;
}

export const MESSAGE_SHORTCUT_LIMIT = 8;

const NO_HINT = '';

const goTo = (label: string, icon: IconName, path: string, hint = NO_HINT): PaletteCommand => ({
  label,
  icon,
  hint,
  action: { type: 'navigate', path },
});

const themeCommand = (darkTheme: boolean): PaletteCommand => ({
  label: darkTheme ? 'Switch to light theme' : 'Switch to dark theme',
  icon: darkTheme ? 'sun' : 'moon',
  hint: 'Appearance',
  action: { type: 'toggle-theme' },
});

export const jumpCommands = (
  darkTheme: boolean,
  workspaceName = NO_HINT,
): readonly PaletteCommand[] => [
  goTo('Go to Dashboard', 'house', '/home'),
  goTo('Go to Messages', 'message-square', '/messages'),
  goTo('Go to Tasks board', 'square-kanban', '/tasks'),
  goTo('Go to Files', 'folder', '/files'),
  goTo('Workspace overview', 'building-2', '/workspace', workspaceName),
  goTo('Workspace members', 'users', '/workspace/members'),
  goTo('Workspace settings', 'settings', '/workspace/settings/general'),
  { label: 'Create a task', icon: 'plus', hint: 'Task', action: { type: 'create-task' } },
  { label: 'Invite people', icon: 'user-plus', hint: NO_HINT, action: { type: 'invite-people' } },
  themeCommand(darkTheme),
  goTo('Open settings', 'settings', '/settings/account'),
];

export const messageCommands = (users: readonly User[]): readonly PaletteCommand[] =>
  users
    .filter((user) => user.id !== CURRENT_USER_ID)
    .slice(0, MESSAGE_SHORTCUT_LIMIT)
    .map((user) => ({
      label: `Message ${user.name}`,
      icon: 'message-square',
      hint: PRESENCE_LABELS[user.status],
      action: { type: 'navigate', path: `/messages/dm-${user.id}` },
    }));
