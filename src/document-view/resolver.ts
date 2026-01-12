import { inject, isDevMode } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { DocumentApiService } from '../api/document-api.service';
import { IDocumentView } from '../api/document.interface';

export const documentResolver: ResolveFn<IDocumentView> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<IDocumentView> => {
  const documentApiService = inject(DocumentApiService);
  // get doc by id in route params and return document response
  const id = route.params['id'];

  if (isDevMode()) {
    console.log('Получение документа с id: ', id);
  }

  // NOTE: MOCK DATA

  return documentApiService.getDocument('1');
};
