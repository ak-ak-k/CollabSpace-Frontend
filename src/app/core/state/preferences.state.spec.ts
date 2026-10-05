import { TestBed } from '@angular/core/testing';
import { PreferencesState } from './preferences.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';

describe('PreferencesState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const load = async (): Promise<PreferencesState> => {
    const state = TestBed.inject(PreferencesState);
    await settle();
    return state;
  };

  it('toggles a boolean preference and reports the new value', async () => {
    const state = await load();

    const on = await state.toggle('enterToSend');

    expect(on).toBe(false);
    expect(state.enterToSend()).toBe(false);
  });

  it('switches one notification channel without touching the others', async () => {
    const state = await load();

    await state.setNotification('team', 'email', true);

    expect(state.preferences().notifications.team).toEqual({
      inapp: true,
      push: false,
      email: true,
    });
  });

  it('signs out of every session except the current one', async () => {
    const state = await load();

    await state.revokeOtherSessions();

    expect(state.sessions().map((session) => session.current)).toEqual([true]);
  });
});
