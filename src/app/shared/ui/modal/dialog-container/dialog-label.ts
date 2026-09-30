import { DialogRef } from '@angular/cdk/dialog';
import { DestroyRef, inject } from '@angular/core';
import { DialogContainerComponent } from './dialog-container.component';

export function labelEnclosingDialog(titleId: string): void {
  const container = inject(DialogRef, { optional: true })?.containerInstance;
  if (!(container instanceof DialogContainerComponent)) {
    return;
  }
  container.registerLabel(titleId);
  inject(DestroyRef).onDestroy(() => container.unregisterLabel(titleId));
}
