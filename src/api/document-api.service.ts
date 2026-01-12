import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

import { IDocumentList } from './document-list.interface';
import { IDocumentView } from './document.interface';

@Injectable({
  providedIn: 'root',
})
export class DocumentApiService {
  public getDocuments(): Observable<IDocumentList> {
    return from(
      fetch('mock/documents.json').then(
        (response) => response.json() as Promise<IDocumentList>
      )
    );
  }

  public getDocument(id: string): Observable<IDocumentView> {
    if (!id) {
      throw new Error('Id is required');
    }

    return from(
      fetch(`mock/documents/${id}.json`).then(
        (response) => response.json() as Promise<IDocumentView>
      )
    );
  }
}
