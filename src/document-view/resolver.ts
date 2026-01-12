import { inject, isDevMode } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { catchError, EMPTY, Observable } from 'rxjs';

import { DocumentApiService } from '../api/document-api.service';
import { IDocumentView } from '../api/document.interface';

export const documentResolver: ResolveFn<IDocumentView> = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<IDocumentView> => {
  const documentApiService = inject(DocumentApiService);
  const router = inject(Router);

  const id = route.params['id'];

  if (isDevMode()) {
    console.log('Получение документа с id: ', id);
  }

  return documentApiService.getDocument(id).pipe(
    catchError((error) => {
      if (isDevMode()) {
        console.error('Ошибка при получении документа: ', error);
        console.log('Перенаправление на страницу 404');
      }

      router.navigate(['/404']);
      return EMPTY;
    })
  );
};
