import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = () =>
  inject(AuthState).authenticated() || inject(Router).createUrlTree(['/login']);

export const guestGuard: CanActivateFn = () =>
  !inject(AuthState).authenticated() || inject(Router).createUrlTree(['/home']);
