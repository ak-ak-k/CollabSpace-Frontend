export type RouteTarget =
  | { readonly kind: 'workspace-settings'; readonly section: string | null }
  | { readonly kind: 'team'; readonly teamId: string; readonly channelId: string | null }
  | { readonly kind: 'conversation'; readonly conversationId: string }
  | { readonly kind: 'task'; readonly taskId: string }
  | { readonly kind: 'open' };

export const TASK_QUERY_PARAM = 'task';

const OPEN_TARGET: RouteTarget = { kind: 'open' };
const SAVED_SEGMENT = 'saved';
const SETTINGS_SEGMENT = 'settings';
const CHANNELS_SEGMENT = 'channels';

const decoded = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

interface SplitUrl {
  readonly segments: readonly string[];
  readonly query: URLSearchParams;
}

const splitUrl = (url: string): SplitUrl => {
  const [beforeFragment] = url.split('#');
  const [path, query = ''] = beforeFragment.split('?');
  return {
    segments: path.split('/').filter(Boolean).map(decoded),
    query: new URLSearchParams(query),
  };
};

const teamTarget = (teamId: string, tab: string | null, channelId: string | null): RouteTarget => ({
  kind: 'team',
  teamId,
  channelId: tab === CHANNELS_SEGMENT ? channelId : null,
});

const taskTarget = (taskId: string | null): RouteTarget =>
  taskId ? { kind: 'task', taskId } : OPEN_TARGET;

export const routeTargetOf = (url: string): RouteTarget => {
  const { segments, query } = splitUrl(url);
  const [section, first = null, second = null, third = null] = segments;
  switch (section) {
    case 'workspace':
      return first === SETTINGS_SEGMENT
        ? { kind: 'workspace-settings', section: second }
        : OPEN_TARGET;
    case 'teams':
      return first ? teamTarget(first, second, third) : OPEN_TARGET;
    case 'messages':
      return first && first !== SAVED_SEGMENT
        ? { kind: 'conversation', conversationId: first }
        : OPEN_TARGET;
    case 'tasks':
      return taskTarget(first ?? query.get(TASK_QUERY_PARAM));
    default:
      return OPEN_TARGET;
  }
};
