import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign in · TeamFlow',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Create account · TeamFlow',
  },
  {
    path: '',
    loadComponent: () => import('@core/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard · TeamFlow',
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('@features/projects/project-list/project-list.component').then(
            m => m.ProjectListComponent,
          ),
        title: 'Projects · TeamFlow',
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('@features/projects/project-details/project-details.component').then(
            m => m.ProjectDetailsComponent,
          ),
        title: 'Project · TeamFlow',
      },
      {
        path: 'projects/:id/board',
        loadComponent: () =>
          import('@features/projects/kanban/kanban.component').then(m => m.KanbanComponent),
        title: 'Board · TeamFlow',
      },
      {
        path: 'discussions',
        loadComponent: () =>
          import('@features/discussions/discussions.component').then(m => m.DiscussionsComponent),
        title: 'Discussions · TeamFlow',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings · TeamFlow',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
