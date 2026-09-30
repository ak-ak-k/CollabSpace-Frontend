import { Routes } from '@angular/router';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./messages-layout/messages-layout.component').then(
        (module) => module.MessagesLayoutComponent,
      ),
    children: [
      {
        path: ':conversationId',
        loadComponent: () =>
          import('./conversation/conversation.component').then(
            (module) => module.ConversationComponent,
          ),
      },
    ],
  },
];
