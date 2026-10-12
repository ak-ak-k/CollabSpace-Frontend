import { channelArchiveEntry, channelCreatedEntry, channelUpdateEntries } from './channel-activity';

const channel = {
  id: 'c-design',
  teamId: 't-design',
  name: 'design',
  description: 'Crits',
  isPrivate: false,
};

describe('channel activity entries', () => {
  it('logs renames and privacy changes for the audit log, descriptions only as activity', () => {
    const entries = channelUpdateEntries(channel, {
      name: 'design-crit',
      description: 'Weekly crits',
      isPrivate: true,
    });

    expect(entries).toEqual([
      expect.objectContaining({
        verb: 'renamed',
        object: '#design to #design-crit',
        action: 'channel.renamed',
        audit: true,
        change: { from: '#design', to: '#design-crit' },
        route: '/teams/t-design/channels/c-design',
      }),
      expect.objectContaining({
        verb: 'made',
        object: '#design-crit private',
        action: 'channel.privacy_changed',
        audit: true,
        change: { from: 'Public', to: 'Private' },
      }),
      expect.objectContaining({ action: 'channel.updated', object: '#design-crit' }),
    ]);
    expect(channelUpdateEntries(channel, { ...channel })).toEqual([]);
  });

  it('flags archiving for the audit log and notes the privacy of new channels', () => {
    expect(channelArchiveEntry(channel, true)).toMatchObject({
      verb: 'archived',
      category: 'activity',
      action: 'channel.archived',
      audit: true,
    });
    expect(channelCreatedEntry(channel, 'Design')).toMatchObject({
      object: '#design in Design',
      meta: { privacy: 'Public' },
    });
  });
});
