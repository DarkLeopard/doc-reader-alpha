export interface IDocumentView {
  id: string;
  name: string;
  pages: {
    number: number;
    imageUrl: string;
  }[];
}
