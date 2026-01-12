import {
  ChangeDetectorRef,
  ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';

import { IAnnotation } from '../../api/annotation.interface';
import { AnnotationComponent } from './annotation.component';
import { AnnotationService } from './annotation.service';

@Directive({
  selector: '[appAnnotations]',
})
export class AnnotationsDirective implements OnInit, OnDestroy {
  private readonly annotationService = inject(AnnotationService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly pageNumber = input.required<number>({ alias: 'appAnnotations' });

  private annotationComponents = new Map<
    string,
    ComponentRef<AnnotationComponent>
  >();

  private clickHandler?: (event: MouseEvent) => void;

  readonly annotations = computed(() => {
    return this.annotationService.getAnnotationsForPage(this.pageNumber());
  });

  readonly isDragging = this.annotationService.isDragging.asReadonly();
  readonly draggedAnnotationId =
    this.annotationService.draggedAnnotationId.asReadonly();

  constructor() {
    effect(() => {
      const annotations = this.annotations();
      this.updateAnnotations(annotations);
    });

    effect(() => {
      const isDragging = this.isDragging();
      const draggedId = this.draggedAnnotationId();
      this.updateDraggingState(isDragging, draggedId);
    });
  }

  ngOnInit(): void {
    this.setupClickHandler();
    this.annotationService.setupDragHandlers();
  }

  ngOnDestroy(): void {
    this.removeClickHandler();
    this.clearAnnotations();
    this.annotationService.removeDragHandlers();
  }

  private setupClickHandler(): void {
    // Директива привязана напрямую к элементу page-container
    const pageElement = this.elementRef.nativeElement;

    this.clickHandler = (event: MouseEvent) => {
      this.handlePageClick(event, pageElement);
    };

    pageElement.addEventListener('click', this.clickHandler);
  }

  private removeClickHandler(): void {
    if (this.clickHandler) {
      const pageElement = this.elementRef.nativeElement;
      pageElement.removeEventListener('click', this.clickHandler);
      this.clickHandler = undefined;
    }
  }

  private handlePageClick(event: MouseEvent, pageElement: HTMLElement): void {
    // Не добавляем аннотацию, если клик был на аннотации или идет перетаскивание
    if (this.isClickOnAnnotation(event) || this.isDragging()) {
      return;
    }

    const text = prompt('Введите текст аннотации:');
    if (!text?.trim()) return;

    this.annotationService.addAnnotationFromEvent(
      this.pageNumber(),
      event,
      pageElement,
      text
    );
  }

  /**
   * Проверяет, был ли клик на элементе аннотации
   * Использует проверку через компоненты аннотаций вместо поиска по CSS-классу
   */
  private isClickOnAnnotation(event: MouseEvent): boolean {
    const target = event.target as HTMLElement;
    if (!target) return false;

    // Проверяем, является ли target или его родитель частью компонента аннотации
    // Компоненты аннотаций создаются через ViewContainerRef и вставляются в DOM
    for (const componentRef of this.annotationComponents.values()) {
      const annotationElement = componentRef.location.nativeElement;
      if (annotationElement.contains(target) || annotationElement === target) {
        return true;
      }
    }

    return false;
  }

  private updateAnnotations(annotations: IAnnotation[]): void {
    const currentIds = new Set(Array.from(this.annotationComponents.keys()));
    const newIds = new Set(annotations.map((a) => a.id));

    // Удаляем аннотации, которых больше нет
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        this.removeAnnotation(id);
      }
    }

    // Добавляем или обновляем существующие аннотации
    for (const annotation of annotations) {
      if (this.annotationComponents.has(annotation.id)) {
        this.updateAnnotation(annotation);
      } else {
        this.createAnnotation(annotation);
      }
    }
  }

  private createAnnotation(annotation: IAnnotation): void {
    const componentRef =
      this.viewContainer.createComponent(AnnotationComponent);
    componentRef.setInput('annotation', annotation);

    componentRef.instance.dragStart.subscribe((data) => {
      this.onAnnotationDragStart(data);
    });

    componentRef.instance.delete.subscribe((data) => {
      this.onAnnotationDelete(data);
    });

    const pageElement = this.elementRef.nativeElement;
    const annotationElement = componentRef.location.nativeElement;
    pageElement.appendChild(annotationElement);

    this.annotationComponents.set(annotation.id, componentRef);

    // Устанавливаем начальное состояние dragging через updateAnnotation
    this.updateAnnotation(annotation);
  }

  private updateAnnotation(annotation: IAnnotation): void {
    const componentRef = this.annotationComponents.get(annotation.id);
    if (!componentRef) return;

    componentRef.setInput('annotation', annotation);
    this.updateDraggingStateForComponent(componentRef, annotation.id);
    this.cdr.markForCheck();
  }

  private updateDraggingStateForComponent(
    componentRef: ComponentRef<AnnotationComponent>,
    annotationId: string
  ): void {
    const isDragging =
      this.draggedAnnotationId() === annotationId && this.isDragging();
    componentRef.setInput('isDragging', isDragging);
  }

  private removeAnnotation(annotationId: string): void {
    const componentRef = this.annotationComponents.get(annotationId);
    if (componentRef) {
      componentRef.destroy();
      this.annotationComponents.delete(annotationId);
      this.cdr.markForCheck();
    }
  }

  private clearAnnotations(): void {
    for (const componentRef of this.annotationComponents.values()) {
      componentRef.destroy();
    }
    this.annotationComponents.clear();
  }

  private updateDraggingState(
    _isDragging: boolean,
    _draggedId: string | null
  ): void {
    for (const [id, componentRef] of this.annotationComponents.entries()) {
      this.updateDraggingStateForComponent(componentRef, id);
    }
    this.cdr.markForCheck();
  }

  private onAnnotationDragStart(data: {
    annotationId: string;
    event: MouseEvent;
  }): void {
    const { annotationId, event } = data;
    event.preventDefault();
    event.stopPropagation();

    // Передаем элемент страницы в сервис для обработки перетаскивания
    const pageElement = this.elementRef.nativeElement;
    this.annotationService.startDrag(annotationId, pageElement);
  }

  private onAnnotationDelete(data: {
    annotationId: string;
    event: MouseEvent;
  }): void {
    const { annotationId, event } = data;
    event.stopPropagation();
    this.annotationService.deleteAnnotation(annotationId);
  }
}
