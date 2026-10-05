import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer.component';
import { injectConversationAccess } from '../../conversation/conversation-access';
import {
  injectConversationExtras,
  injectConversationView,
} from '../../conversation/conversation-context';
import { ConversationDetailsComponent } from '../conversation-details.component';

export interface DetailsDrawerData {
  readonly conversationId: string;
}

export interface DetailsDrawerResult {
  readonly jumpTo: string;
}

@Component({
  selector: 'app-details-drawer',
  imports: [DrawerComponent, ConversationDetailsComponent],
  templateUrl: './details-drawer.component.html',
  styleUrl: './details-drawer.component.scss',
})
export class DetailsDrawerComponent {
  private readonly dialogRef = inject<DialogRef<DetailsDrawerResult>>(DialogRef);
  private readonly data = inject<DetailsDrawerData>(DIALOG_DATA);

  protected readonly view = injectConversationView(() => this.data.conversationId);
  protected readonly extras = injectConversationExtras(() => this.data.conversationId);
  protected readonly access = injectConversationAccess(this.view);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close());
  }

  protected jumpTo(messageId: string): void {
    this.dialogRef.close({ jumpTo: messageId });
  }
}
