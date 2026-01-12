import { IAnnotation } from './annotation.interface';

export interface IDocumentView {
  id: string;
  name: string;
  annotations?: IAnnotation[];
  pages: {
    number: number;
    imageUrl: string;
  }[];
}
