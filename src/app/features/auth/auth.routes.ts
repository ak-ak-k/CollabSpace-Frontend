import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./auth-layout/auth-layout.component').then((module) => module.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        title: 'Log in · CollabSpace',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./login/login.component').then((module) => module.LoginComponent),
      },
      {
        path: 'signup',
        title: 'Sign up · CollabSpace',
        loadComponent: () =>
          import('./signup/signup.component').then((module) => module.SignupComponent),
      },
      {
        path: 'forgot-password',
        title: 'Forgot password · CollabSpace',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./forgot-password/forgot-password.component').then(
            (module) => module.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        title: 'Reset password · CollabSpace',
        loadComponent: () =>
          import('./reset-password/reset-password.component').then(
            (module) => module.ResetPasswordComponent,
          ),
      },
    ],
  },
];
