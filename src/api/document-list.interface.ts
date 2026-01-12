import { IDocumentView } from './document.interface';

export interface IDocumentList {
  documents: Pick<IDocumentView, 'id' | 'name'>[];
}
