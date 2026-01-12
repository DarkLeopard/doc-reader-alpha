import { inject, isDevMode } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { DocumentApiService } from '../api/document-api.service';
import { IDocumentList } from '../api/document-list.interface';

export const documentListResolver: ResolveFn<IDocumentList> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<IDocumentList> => {
  const documentApiService = inject(DocumentApiService);

  if (isDevMode()) {
    console.log('Получение списка документов');
  }

  return documentApiService.getDocuments();
};
