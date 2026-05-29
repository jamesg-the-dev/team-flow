import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.component').then(m => m.SettingsComponent),
    title: 'Settings · TeamFlow',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./panels/profile-panel/profile-panel.component').then(
            m => m.ProfilePanelComponent,
          ),
        title: 'Profile · Settings · TeamFlow',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./panels/notifications-panel/notifications-panel.component').then(
            m => m.NotificationsPanelComponent,
          ),
        title: 'Notifications · Settings · TeamFlow',
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./panels/security-panel/security-panel.component').then(
            m => m.SecurityPanelComponent,
          ),
        title: 'Security · Settings · TeamFlow',
      },
      {
        path: 'appearance',
        loadComponent: () =>
          import('./panels/appearance-panel/appearance-panel.component').then(
            m => m.AppearancePanelComponent,
          ),
        title: 'Appearance · Settings · TeamFlow',
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./panels/team-panel/team-panel.component').then(m => m.TeamPanelComponent),
        title: 'Team · Settings · TeamFlow',
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./panels/billing-panel/billing-panel.component').then(
            m => m.BillingPanelComponent,
          ),
        title: 'Billing · Settings · TeamFlow',
      },
    ],
  },
];
