import { IconName } from '../../shared/ui/icon/icon-registry';
import { ACTIVITY_ICONS, ActivityEvent } from '../models/activity';
import { Channel } from '../models/channel';
import { Message } from '../models/message';
import { WORKSPACE_ACTIVITY_ICONS, WorkspaceActivityEvent } from '../models/workspace-activity';

export interface PersonActivityItem {
  readonly id: string;
  readonly verb: string;
  readonly object: string;
  readonly route: string;
  readonly occurredAt: number;
  readonly icon: IconName;
  readonly snippet: string;
}

export interface PersonActivitySources {
  readonly teamActivity: readonly ActivityEvent[];
  readonly workspaceActivity: readonly WorkspaceActivityEvent[];
  readonly channels: readonly Channel[];
  readonly messages: Readonly<Record<string, readonly Message[]>>;
}

export const PERSON_ACTIVITY_LIMIT = 5;

const POSTED_VERB = 'posted in';

const fromTeamEvent = (event: ActivityEvent): PersonActivityItem => ({
  id: event.id,
  verb: event.verb,
  object: event.object,
  route: event.route,
  occurredAt: event.occurredAt,
  icon: ACTIVITY_ICONS[event.kind],
  snippet: '',
});

const fromWorkspaceEvent = (event: WorkspaceActivityEvent): PersonActivityItem => ({
  id: event.id,
  verb: event.verb,
  object: event.object,
  route: event.route,
  occurredAt: event.occurredAt,
  icon: WORKSPACE_ACTIVITY_ICONS[event.kind],
  snippet: '',
});

const latestPostBy = (userId: string, messages: readonly Message[]): Message | null =>
  [...messages].reverse().find((message) => message.authorId === userId && !!message.text) ?? null;

const channelPosts = (userId: string, sources: PersonActivitySources): PersonActivityItem[] =>
  sources.channels
    .filter((channel) => !channel.isPrivate)
    .flatMap((channel) => {
      const post = latestPostBy(userId, sources.messages[channel.id] ?? []);
      return post
        ? [
            {
              id: post.id,
              verb: POSTED_VERB,
              object: `#${channel.name}`,
              route: `/teams/${channel.teamId}/channels/${channel.id}`,
              occurredAt: post.sentAt,
              icon: 'message-square' as const,
              snippet: post.text,
            },
          ]
        : [];
    });

export const personActivityOf = (
  userId: string,
  sources: PersonActivitySources,
  limit = PERSON_ACTIVITY_LIMIT,
): readonly PersonActivityItem[] =>
  [
    ...sources.teamActivity.filter((event) => event.actorId === userId).map(fromTeamEvent),
    ...sources.workspaceActivity
      .filter((event) => event.actorId === userId)
      .map(fromWorkspaceEvent),
    ...channelPosts(userId, sources),
  ]
    .sort((first, second) => second.occurredAt - first.occurredAt)
    .slice(0, limit);
