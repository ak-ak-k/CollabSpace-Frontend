import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageView } from '../../../core/models/thread';
import { DialogService } from '../../../core/services/dialog.service';
import { WorkspaceActions } from '../../workspace/workspace-actions.service';
import {
  DetailsDrawerComponent,
  DetailsDrawerData,
  DetailsDrawerResult,
} from '../conversation-details/details-drawer/details-drawer.component';
import {
  MessageActionsSheetComponent,
  MessageActionsSheetData,
  MessageActionsSheetResult,
} from './message-actions-sheet/message-actions-sheet.component';

@Injectable()
export class ConversationOverlays {
  private readonly dialogs = inject(DialogService);
  private readonly workspaceActions = inject(WorkspaceActions);

  openDetails(conversationId: string): Observable<DetailsDrawerResult | undefined> {
    return this.dialogs.openDrawer<DetailsDrawerResult, DetailsDrawerData>(DetailsDrawerComponent, {
      data: { conversationId },
      side: 'right',
      size: 'md',
      ariaLabel: 'Details',
    }).closed;
  }

  openMessageActions(message: MessageView): Observable<MessageActionsSheetResult | undefined> {
    return this.dialogs.openDrawer<MessageActionsSheetResult, MessageActionsSheetData>(
      MessageActionsSheetComponent,
      { data: { message }, side: 'bottom', ariaLabel: 'Message actions' },
    ).closed;
  }

  invite(teamId: string | undefined): void {
    this.workspaceActions.openInvite(teamId ?? null);
  }
}
