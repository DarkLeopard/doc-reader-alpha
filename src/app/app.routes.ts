import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('../doc-list').then((m) => m.routes),
  },
  {
    path: 'document',
    loadChildren: () => import('../document-view').then((m) => m.routes),
  },
  {
    path: '404',
    loadComponent: () => import('../page-404').then((m) => m.Page404),
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full',
  },
];
