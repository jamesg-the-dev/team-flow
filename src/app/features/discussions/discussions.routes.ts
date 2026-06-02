import { Routes } from '@angular/router';

import { DiscussionsComponent } from './discussions.component';

export const DISCUSSIONS_ROUTES: Routes = [
  {
    path: '',
    component: DiscussionsComponent,
    children: [
      {
        path: ':channelId',
        loadComponent: () =>
          import('./thread/discussions-thread.component').then(m => m.DiscussionsThreadComponent),
        title: 'Channel · TeamFlow',
      },
    ],
  },
];
