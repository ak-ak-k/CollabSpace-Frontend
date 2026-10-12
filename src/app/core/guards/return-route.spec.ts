import { isReturnableRoute, returnRouteOf } from './return-route';

describe('return route', () => {
  it('accepts in-app routes with their query', () => {
    expect(isReturnableRoute('/teams/t-frontend/channels/c-releases')).toBe(true);
    expect(isReturnableRoute('/tasks/NS-142?view=list')).toBe(true);
    expect(isReturnableRoute('/home')).toBe(true);
  });

  it('rejects public, system, unknown and external routes', () => {
    expect(isReturnableRoute('/login?expired=1')).toBe(false);
    expect(isReturnableRoute('/session-expired')).toBe(false);
    expect(isReturnableRoute('/403')).toBe(false);
    expect(isReturnableRoute('/nope')).toBe(false);
    expect(isReturnableRoute('//evil.example/home')).toBe(false);
    expect(isReturnableRoute('https://evil.example/home')).toBe(false);
    expect(isReturnableRoute(null)).toBe(false);
  });

  it('returns only a valid stored route', () => {
    expect(returnRouteOf('/files/recent')).toBe('/files/recent');
    expect(returnRouteOf('/offline')).toBeNull();
    expect(returnRouteOf(undefined)).toBeNull();
  });
});
