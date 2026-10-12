export const STANDALONE_DISPLAY_QUERY = '(display-mode: standalone)';

export interface BrowserIdentity {
  readonly userAgent: string;
  readonly platform: string;
  readonly maxTouchPoints: number;
}

interface HomeScreenNavigator extends Navigator {
  readonly standalone?: boolean;
}

const APPLE_MOBILE_AGENT = /iphone|ipad|ipod/i;
const SAFARI_AGENT = /safari/i;
const OTHER_IOS_BROWSER_AGENT = /crios|fxios|edgios/i;
const DESKTOP_MAC_PLATFORM = 'MacIntel';

export const isAppleMobile = (browser: BrowserIdentity): boolean =>
  APPLE_MOBILE_AGENT.test(browser.userAgent) ||
  (browser.platform === DESKTOP_MAC_PLATFORM && browser.maxTouchPoints > 1);

export const isIosSafari = (browser: BrowserIdentity): boolean =>
  isAppleMobile(browser) &&
  SAFARI_AGENT.test(browser.userAgent) &&
  !OTHER_IOS_BROWSER_AGENT.test(browser.userAgent);

export const standaloneQueryOf = (view: Window): MediaQueryList | null => {
  try {
    return view.matchMedia?.(STANDALONE_DISPLAY_QUERY) ?? null;
  } catch {
    return null;
  }
};

export const isStandaloneDisplay = (view: Window): boolean =>
  standaloneQueryOf(view)?.matches === true ||
  (view.navigator as HomeScreenNavigator).standalone === true;
