import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthState).authenticated() ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

export const guestGuard: CanActivateFn = () =>
  !inject(AuthState).authenticated() || inject(Router).createUrlTree(['/home']);

export const signedOutMatch: CanMatchFn = () => !inject(AuthState).authenticated();
