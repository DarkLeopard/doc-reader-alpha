import { Routes } from '@angular/router';
import { MessageService } from 'primeng/api';

import { DocumentView } from './document-view';
import { documentResolver } from './resolver';

export const routes: Routes = [
  {
    path: ':id',
    component: DocumentView,
    resolve: {
      document: documentResolver,
    },
    providers: [MessageService],
  },
];
