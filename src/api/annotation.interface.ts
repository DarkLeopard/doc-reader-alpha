export interface IAnnotation {
  id: string;
  text: string;
  pageNumber: number;
  x: number; // позиция в процентах от ширины страницы
  y: number; // позиция в процентах от высоты страницы
}
