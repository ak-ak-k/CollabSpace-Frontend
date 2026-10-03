import { inject, Service } from '@angular/core';
import { MOCK_INTEGRATIONS, MOCK_PREFERENCES, MOCK_SESSIONS } from '../mocks/settings.mock';
import {
  DeviceSession,
  Integration,
  NotificationChannel,
  NotificationTopic,
  Preferences,
} from '../models/preferences';
import { MockRequest } from './mock-request';

export interface SettingsSnapshot {
  readonly preferences: Preferences;
  readonly sessions: readonly DeviceSession[];
  readonly integrations: readonly Integration[];
}

@Service()
export class SettingsData {
  private readonly request = inject(MockRequest);

  private preferences = MOCK_PREFERENCES;
  private sessions = [...MOCK_SESSIONS];
  private integrations = [...MOCK_INTEGRATIONS];

  getSettings(): Promise<SettingsSnapshot> {
    return this.request.read(() => this.snapshot(), this.snapshot());
  }

  updatePreferences(changes: Partial<Preferences>): Promise<Preferences> {
    return this.request.write(() => {
      this.preferences = { ...this.preferences, ...changes };
      return this.preferences;
    });
  }

  setNotification(
    topic: NotificationTopic,
    channel: NotificationChannel,
    on: boolean,
  ): Promise<Preferences> {
    const notifications = {
      ...this.preferences.notifications,
      [topic]: { ...this.preferences.notifications[topic], [channel]: on },
    };
    return this.updatePreferences({ notifications });
  }

  revokeSessions(sessionIds: readonly string[]): Promise<readonly DeviceSession[]> {
    return this.request.write(() => {
      this.sessions = this.sessions.filter((session) => !sessionIds.includes(session.id));
      return this.sessions;
    });
  }

  setIntegration(id: string, connected: boolean): Promise<readonly Integration[]> {
    return this.request.write(() => {
      this.integrations = this.integrations.map((integration) =>
        integration.id === id ? { ...integration, connected } : integration,
      );
      return this.integrations;
    });
  }

  private snapshot(): SettingsSnapshot {
    return {
      preferences: this.preferences,
      sessions: this.sessions,
      integrations: this.integrations,
    };
  }
}
