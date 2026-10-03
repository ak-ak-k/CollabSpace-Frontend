import { computed, DOCUMENT, effect, inject, Service, signal, untracked } from '@angular/core';
import { SettingsData, SettingsSnapshot } from '../data/settings.data';
import { MOCK_PREFERENCES, MOCK_ROLE_NAMES, MOCK_ROLE_PERMISSIONS } from '../mocks/settings.mock';
import {
  BooleanPreference,
  DeviceSession,
  Integration,
  NotificationChannel,
  NotificationTopic,
  Preferences,
} from '../models/preferences';
import { DataModeState } from './data-mode.state';
import { Loadable } from './loadable';

@Service()
export class PreferencesState {
  private readonly data = inject(SettingsData);
  private readonly dataMode = inject(DataModeState);
  private readonly document = inject(DOCUMENT);

  readonly preferences = signal<Preferences>(MOCK_PREFERENCES);
  readonly sessions = signal<readonly DeviceSession[]>([]);
  readonly integrations = signal<readonly Integration[]>([]);
  readonly roleNames = MOCK_ROLE_NAMES;
  readonly rolePermissions = MOCK_ROLE_PERMISSIONS;

  private readonly loader = new Loadable<SettingsSnapshot>({
    fetch: () => this.data.getSettings(),
    store: (snapshot) => this.store(snapshot),
    isEmpty: () => false,
  });

  readonly status = this.loader.status;
  readonly enterToSend = computed(() => this.preferences().enterToSend);
  readonly statusMessage = computed(() => this.preferences().statusMessage);
  readonly otherSessions = computed(() => this.sessions().filter((session) => !session.current));

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
    effect(() => this.applyDisplayPreferences(this.preferences()));
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  async update(changes: Partial<Preferences>): Promise<void> {
    this.preferences.update((preferences) => ({ ...preferences, ...changes }));
    await this.data.updatePreferences(changes);
  }

  async toggle(key: BooleanPreference): Promise<boolean> {
    const on = !this.preferences()[key];
    await this.update({ [key]: on });
    return on;
  }

  async setNotification(
    topic: NotificationTopic,
    channel: NotificationChannel,
    on: boolean,
  ): Promise<void> {
    this.preferences.update((preferences) => ({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [topic]: { ...preferences.notifications[topic], [channel]: on },
      },
    }));
    await this.data.setNotification(topic, channel, on);
  }

  async revokeSession(sessionId: string): Promise<void> {
    this.sessions.set(await this.data.revokeSessions([sessionId]));
  }

  async revokeOtherSessions(): Promise<void> {
    const ids = this.otherSessions().map((session) => session.id);
    this.sessions.set(await this.data.revokeSessions(ids));
  }

  async setIntegration(id: string, connected: boolean): Promise<void> {
    this.integrations.update((integrations) =>
      integrations.map((integration) =>
        integration.id === id ? { ...integration, connected } : integration,
      ),
    );
    await this.data.setIntegration(id, connected);
  }

  private applyDisplayPreferences(preferences: Preferences): void {
    const root = this.document.documentElement;
    root.dataset['density'] = preferences.density;
    root.toggleAttribute('data-reduce-motion', preferences.reduceMotion);
  }

  private store(snapshot: SettingsSnapshot): void {
    this.preferences.set(snapshot.preferences);
    this.sessions.set(snapshot.sessions);
    this.integrations.set(snapshot.integrations);
  }
}
