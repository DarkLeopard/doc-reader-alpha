import { Routes } from '@angular/router';
import { DocumentView } from './document-view';
import { documentResolver } from './resolver';

export const routes: Routes = [
  {
    path: ':id',
    component: DocumentView,
    resolve: {
      document: documentResolver,
    },
  },
];
