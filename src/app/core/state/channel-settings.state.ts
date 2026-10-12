import { inject, Service } from '@angular/core';
import { Channel, ChannelChanges } from '../models/channel';
import { ActivityLogState } from './activity-log.state';
import { channelUpdateEntries } from './channel-activity';
import { WorkspaceState } from './workspace.state';

@Service()
export class ChannelSettingsState {
  private readonly workspace = inject(WorkspaceState);
  private readonly activity = inject(ActivityLogState);

  async update(channelId: string, changes: ChannelChanges): Promise<Channel> {
    const previous = this.workspace.channels().find((channel) => channel.id === channelId);
    const updated = await this.workspace.updateChannel(channelId, changes);
    if (previous) {
      channelUpdateEntries(previous, changes)
        .reverse()
        .forEach((entry) => this.activity.record(entry));
    }
    return updated;
  }
}
