import { UrlSegment, UrlSegmentGroup } from '@angular/router';
import { conversationRouteMatcher } from './conversation-route-matcher';

const segmentsOf = (path: string): UrlSegment[] =>
  path.split('/').map((part) => new UrlSegment(part, {}));

const paramsOf = (pattern: readonly string[], path: string): Record<string, string> | null => {
  const segments = segmentsOf(path);
  const group = new UrlSegmentGroup(segments, {});
  const result = conversationRouteMatcher(pattern)(segments, group, {});
  if (!result) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(result.posParams ?? {}).map(([name, segment]) => [name, segment.path]),
  );
};

describe('conversationRouteMatcher', () => {
  const MESSAGES = [':conversationId'];
  const CHANNELS = [':teamId', 'channels', ':channelId'];

  it('matches a conversation with an optional message or thread', () => {
    expect(paramsOf(MESSAGES, 'g-launch')).toEqual({ conversationId: 'g-launch' });
    expect(paramsOf(MESSAGES, 'g-launch/m/m1')).toEqual({
      conversationId: 'g-launch',
      messageId: 'm1',
    });
    expect(paramsOf(MESSAGES, 'g-launch/thread/g-launch-0')).toEqual({
      conversationId: 'g-launch',
      rootId: 'g-launch-0',
    });
  });

  it('matches channel routes and rejects unknown shapes', () => {
    expect(paramsOf(CHANNELS, 't-frontend/channels/c-frontend/thread/t1')).toEqual({
      teamId: 't-frontend',
      channelId: 'c-frontend',
      rootId: 't1',
    });
    expect(paramsOf(CHANNELS, 't-frontend/members')).toBeNull();
    expect(paramsOf(MESSAGES, 'g-launch/thread')).toBeNull();
    expect(paramsOf(MESSAGES, 'g-launch/files/f1')).toBeNull();
  });
});
