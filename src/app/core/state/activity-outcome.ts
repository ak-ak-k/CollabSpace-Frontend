import { ActivityEvent, ActivityKind, ActivityOutcome } from '../models/activity';

export type ActivityMatcher = (event: ActivityEvent) => boolean;

export interface OutcomeChange {
  readonly events: readonly ActivityEvent[];
  readonly changedIds: ReadonlySet<string>;
}

export const isUnsettled = (event: ActivityEvent): boolean => event.outcome !== 'succeeded';

export const pendingOfKind =
  (kind: ActivityKind): ActivityMatcher =>
  (event) =>
    event.kind === kind && event.outcome === 'pending';

export const unsettledOfKind =
  (kind: ActivityKind): ActivityMatcher =>
  (event) =>
    event.kind === kind && isUnsettled(event);

export const withOutcome = (
  events: readonly ActivityEvent[],
  matches: ActivityMatcher,
  outcome: ActivityOutcome,
): OutcomeChange => {
  const changedIds = new Set<string>();
  const next = events.map((event) => {
    if (event.outcome === outcome || !matches(event)) {
      return event;
    }
    changedIds.add(event.id);
    return { ...event, outcome };
  });
  return { events: changedIds.size ? next : events, changedIds };
};
