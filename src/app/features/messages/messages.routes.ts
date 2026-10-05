import { Routes } from '@angular/router';
import { conversationRouteMatcher } from './conversation-route-matcher';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./messages-layout/messages-layout.component').then(
        (module) => module.MessagesLayoutComponent,
      ),
    children: [
      {
        path: 'saved',
        loadComponent: () =>
          import('./saved-messages/saved-messages.component').then(
            (module) => module.SavedMessagesComponent,
          ),
      },
      {
        matcher: conversationRouteMatcher([':conversationId']),
        loadComponent: () =>
          import('./conversation/conversation.component').then(
            (module) => module.ConversationComponent,
          ),
      },
    ],
  },
];
