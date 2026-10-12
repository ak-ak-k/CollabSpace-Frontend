import { IconName } from '../../shared/ui/icon/icon-registry';

export type RouteBlockKind = 'denied' | 'not-found';

export type RouteBlockTone = 'inverted' | 'neutral';

export interface RouteBlockLink {
  readonly label: string;
  readonly href: string;
  readonly icon: IconName;
}

export interface AccessRequest {
  readonly owner: string;
}

export interface SystemPageContext {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly icon: IconName | null;
  readonly tone: RouteBlockTone;
  readonly back: RouteBlockLink;
  readonly request: AccessRequest | null;
  readonly noLists: boolean;
}

export interface RouteBlock {
  readonly kind: RouteBlockKind;
  readonly context: SystemPageContext;
}

export const DASHBOARD_ROUTE = '/home';
