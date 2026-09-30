import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer.component';
import {
  injectConversationExtras,
  injectConversationView,
} from '../../conversation/conversation-context';
import { ConversationDetailsComponent } from '../conversation-details.component';

export interface DetailsDrawerData {
  readonly conversationId: string;
}

export type DetailsDrawerResult = { readonly jumpTo: string } | { readonly addPeople: true };

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

  protected jumpTo(messageId: string): void {
    this.dialogRef.close({ jumpTo: messageId });
  }

  protected addPeople(): void {
    this.dialogRef.close({ addPeople: true });
  }
}
