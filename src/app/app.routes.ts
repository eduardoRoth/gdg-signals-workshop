import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/list/list.page').then((m) => m.ListPage),
  },
  {
    path: '{id}',
    loadComponent: () =>
      import('./pages/detail/detail.page').then((m) => m.DetailPage),
  },
];
