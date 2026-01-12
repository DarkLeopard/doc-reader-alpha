import { Routes } from '@angular/router';

import { DocList } from './doc-list';
import { documentListResolver } from './resolver';

export const routes: Routes = [
  {
    path: '',
    component: DocList,
    resolve: {
      documents: documentListResolver,
    },
  },
];
