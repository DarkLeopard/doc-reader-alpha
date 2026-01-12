import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

import { IAnnotation } from '../../api/annotation.interface';

@Injectable({
  providedIn: 'root',
})
export class AnnotationService {
  private readonly documentRef = inject(DOCUMENT);

  private readonly annotations = signal<IAnnotation[]>([]);
  private annotationCounter = 0;

  private dragHandler?: (e: MouseEvent) => void;
  private dropHandler?: () => void;
  private dragHandlersSetup = false;
  private currentPageElement: HTMLElement | null = null;

  readonly annotationsByPage = computed(() => {
    const annotations = this.annotations();
    const grouped = new Map<number, IAnnotation[]>();

    for (const annotation of annotations) {
      const pageNum = annotation.pageNumber;
      const pageAnnotations = grouped.get(pageNum);
      if (pageAnnotations) {
        pageAnnotations.push(annotation);
      } else {
        grouped.set(pageNum, [annotation]);
      }
    }

    return grouped;
  });

  readonly isDragging = signal<boolean>(false);
  readonly draggedAnnotationId = signal<string | null>(null);

  getAnnotationsForPage(pageNumber: number): IAnnotation[] {
    return this.annotationsByPage().get(pageNumber) ?? [];
  }

  /**
   * Добавляет аннотацию на основе события клика на странице
   */
  addAnnotationFromEvent(
    pageNumber: number,
    event: MouseEvent,
    pageElement: HTMLElement,
    text: string
  ): IAnnotation | null {
    if (!text?.trim()) return null;

    const position = this.calculatePositionFromEvent(event, pageElement);
    return this.addAnnotation(pageNumber, position.x, position.y, text);
  }

  /**
   * Начинает перетаскивание аннотации
   * @param annotationId - ID аннотации
   * @param pageElement - Элемент страницы, на которой находится аннотация
   */
  startDrag(annotationId: string, pageElement: HTMLElement): boolean {
    const annotation = this.getAnnotationById(annotationId);
    if (!annotation) return false;

    this.isDragging.set(true);
    this.draggedAnnotationId.set(annotationId);
    this.currentPageElement = pageElement;
    return true;
  }

  /**
   * Настраивает обработчики событий для drag & drop
   */
  setupDragHandlers(): void {
    // Настраиваем обработчики (только один раз)
    if (this.dragHandlersSetup) return;

    this.dragHandler = (e: MouseEvent) => this.handleDrag(e);
    this.dropHandler = () => this.stopDrag();

    if (this.documentRef.defaultView) {
      this.documentRef.defaultView.addEventListener(
        'mousemove',
        this.dragHandler
      );
      this.documentRef.defaultView.addEventListener(
        'mouseup',
        this.dropHandler
      );
    }

    this.dragHandlersSetup = true;
  }

  /**
   * Удаляет обработчики событий для drag & drop
   */
  removeDragHandlers(): void {
    if (this.dragHandler && this.documentRef.defaultView) {
      this.documentRef.defaultView.removeEventListener(
        'mousemove',
        this.dragHandler
      );
    }
    if (this.dropHandler && this.documentRef.defaultView) {
      this.documentRef.defaultView.removeEventListener(
        'mouseup',
        this.dropHandler
      );
    }
    this.dragHandler = undefined;
    this.dropHandler = undefined;
    this.dragHandlersSetup = false;
  }

  deleteAnnotation(annotationId: string): void {
    this.annotations.update((annotations) =>
      annotations.filter((a) => a.id !== annotationId)
    );
  }

  getAnnotations(): IAnnotation[] {
    return this.annotations();
  }

  private clampPosition(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  /**
   * Вычисляет позицию в процентах относительно элемента страницы из события мыши
   */
  private calculatePositionFromEvent(
    event: MouseEvent,
    pageElement: HTMLElement
  ): { x: number; y: number } {
    const rect = pageElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: this.clampPosition(x),
      y: this.clampPosition(y),
    };
  }

  /**
   * Останавливает перетаскивание
   */
  private stopDrag(): void {
    this.isDragging.set(false);
    this.draggedAnnotationId.set(null);
    this.currentPageElement = null;
  }

  /**
   * Обрабатывает событие перетаскивания
   */
  private handleDrag(event: MouseEvent): void {
    if (!this.isDragging() || !this.currentPageElement) return;

    const annotationId = this.draggedAnnotationId();
    if (!annotationId) return;

    const position = this.calculatePositionFromEvent(
      event,
      this.currentPageElement
    );
    this.updateAnnotationPosition(annotationId, position.x, position.y);
  }

  private getAnnotationById(annotationId: string): IAnnotation | undefined {
    return this.annotations().find((a) => a.id === annotationId);
  }

  private addAnnotation(
    pageNumber: number,
    x: number,
    y: number,
    text: string
  ): IAnnotation {
    const newAnnotation: IAnnotation = {
      id: `annotation-${++this.annotationCounter}`,
      text: text.trim(),
      pageNumber,
      x: this.clampPosition(x),
      y: this.clampPosition(y),
    };

    this.annotations.update((annotations) => [...annotations, newAnnotation]);
    return newAnnotation;
  }

  private updateAnnotationPosition(
    annotationId: string,
    x: number,
    y: number
  ): void {
    this.annotations.update((annotations) =>
      annotations.map((a) =>
        a.id === annotationId
          ? {
              ...a,
              x: this.clampPosition(x),
              y: this.clampPosition(y),
            }
          : a
      )
    );
  }
}
