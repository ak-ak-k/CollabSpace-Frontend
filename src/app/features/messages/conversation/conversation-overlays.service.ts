import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageMenuItem } from '../../../shared/components/message-bubble/message-menu';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { DialogService } from '../../../core/services/dialog.service';
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
import { ConversationSessionState } from './conversation-session.state';

@Injectable()
export class ConversationOverlays {
  private readonly dialogs = inject(DialogService);
  private readonly breakpoint = inject(BreakpointService);
  private readonly session = inject(ConversationSessionState);

  showDetails(conversationId: string, toggle: boolean, jumpTo: (messageId: string) => void): void {
    if (!this.breakpoint.isDesktop()) {
      this.openDetails(conversationId).subscribe((result) => {
        if (result) {
          jumpTo(result.jumpTo);
        }
      });
    } else if (toggle) {
      this.session.toggleDockedDetails();
    } else {
      this.session.dockedDetailsOpen.set(true);
    }
  }

  openDetails(conversationId: string): Observable<DetailsDrawerResult | undefined> {
    return this.dialogs.openDrawer<DetailsDrawerResult, DetailsDrawerData>(DetailsDrawerComponent, {
      data: { conversationId },
      side: 'right',
      size: 'md',
      ariaLabel: 'Details',
    }).closed;
  }

  openMessageActions(
    items: readonly MessageMenuItem[],
  ): Observable<MessageActionsSheetResult | undefined> {
    return this.dialogs.openDrawer<MessageActionsSheetResult, MessageActionsSheetData>(
      MessageActionsSheetComponent,
      { data: { items }, side: 'bottom', ariaLabel: 'Message actions' },
    ).closed;
  }
}
