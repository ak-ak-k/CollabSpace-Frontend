import { isDevMode } from '@angular/core';
import { CanMatchFn } from '@angular/router';

export const devModeGuard: CanMatchFn = () => isDevMode();
