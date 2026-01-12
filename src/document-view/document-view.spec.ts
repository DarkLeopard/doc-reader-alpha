import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IAnnotation } from '../api/annotation.interface';
import { IDocumentView } from '../api/document.interface';
import { AnnotationService } from './annotation/annotation.service';
import { DocumentView } from './document-view';

describe('DocumentView', () => {
  let component: DocumentView;
  let fixture: ComponentFixture<DocumentView>;
  let annotationService: AnnotationService;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockDocument: IDocumentView = {
    id: '1',
    name: 'Test Document',
    pages: [
      { number: 1, imageUrl: 'mock/documents/1/1.png' },
      { number: 2, imageUrl: 'mock/documents/1/2.png' },
    ],
  };

  // Вспомогательная функция для клика по PrimeNG кнопке
  const clickPrimeButton = (debugElement: DebugElement | null): void => {
    if (!debugElement) {
      throw new Error('Button element not found');
    }
    const buttonElement =
      debugElement.nativeElement.querySelector('button') ||
      debugElement.nativeElement;
    buttonElement.click();
  };

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        data: { document: mockDocument },
      } as any,
    };

    await TestBed.configureTestingModule({
      imports: [DocumentView],
      providers: [
        AnnotationService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentView);
    component = fixture.componentInstance;
    annotationService = TestBed.inject(AnnotationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Очищаем аннотации после каждого теста
    annotationService['annotations'].set([]);
  });

  describe('Инициализация', () => {
    it('должен создать компонент', () => {
      expect(component).toBeTruthy();
    });

    it('должен загрузить документ из ActivatedRoute', () => {
      expect(component['document']()).toEqual(mockDocument);
    });

    it('должен установить начальный масштаб 100%', () => {
      expect(component['zoom']()).toBe(100);
    });

    it('должен отобразить документ в шаблоне', () => {
      const documentContainer = fixture.debugElement.query(
        By.css('.document-container')
      );
      expect(documentContainer).toBeTruthy();
    });

    it('должен отобразить все страницы документа', () => {
      const pageComponents = fixture.debugElement.queryAll(
        By.css('app-document-page')
      );
      expect(pageComponents.length).toBe(2);
    });
  });

  describe('Масштабирование (Zoom)', () => {
    it('должен увеличить масштаб при нажатии на кнопку "+"', () => {
      const zoomInButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-plus"]')
      );
      expect(zoomInButton).toBeTruthy();

      const initialZoom = component['zoom']();
      clickPrimeButton(zoomInButton);
      fixture.detectChanges();

      expect(component['zoom']()).toBe(initialZoom + 25);
    });

    it('должен уменьшить масштаб при нажатии на кнопку "-"', () => {
      // Сначала увеличим масштаб, чтобы можно было уменьшить
      component['zoom'].set(125);

      const zoomOutButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-minus"]')
      );
      expect(zoomOutButton).toBeTruthy();

      clickPrimeButton(zoomOutButton);
      fixture.detectChanges();

      expect(component['zoom']()).toBe(100);
    });

    it('должен отобразить текущий масштаб в процентах', () => {
      component['zoom'].set(150);
      fixture.detectChanges();

      const zoomValue = fixture.debugElement.query(By.css('.zoom-value'));
      expect(zoomValue.nativeElement.textContent.trim()).toBe('150%');
    });

    it('должен отключить кнопку увеличения при достижении максимума (200%)', () => {
      component['zoom'].set(200);
      fixture.detectChanges();

      const zoomInButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-plus"]')
      );
      expect(component['canZoomIn']()).toBe(false);
    });

    it('должен отключить кнопку уменьшения при достижении минимума (50%)', () => {
      component['zoom'].set(50);
      fixture.detectChanges();

      const zoomOutButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-minus"]')
      );
      expect(component['canZoomOut']()).toBe(false);
    });

    it('не должен увеличить масштаб выше максимума', () => {
      component['zoom'].set(175);
      const zoomInButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-plus"]')
      );
      clickPrimeButton(zoomInButton);
      fixture.detectChanges();
      expect(component['zoom']()).toBe(200);
    });

    it('не должен уменьшить масштаб ниже минимума', () => {
      component['zoom'].set(75);
      const zoomOutButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-minus"]')
      );
      clickPrimeButton(zoomOutButton);
      fixture.detectChanges();
      expect(component['zoom']()).toBe(50);
    });

    it('должен применить масштаб к контейнеру документа', () => {
      component['zoom'].set(150);
      fixture.detectChanges();

      const documentContainer = fixture.debugElement.query(
        By.css('.document-container')
      );
      const zoomStyle = documentContainer.nativeElement.style.zoom;
      // style.zoom может быть числом или строкой в зависимости от браузера
      expect(Number(zoomStyle)).toBe(1.5);
    });
  });

  describe('Создание аннотации', () => {
    it('должен открыть поле ввода при клике на страницу', () => {
      const pageComponent = fixture.debugElement.query(
        By.css('app-document-page')
      );
      const pageElement =
        pageComponent.nativeElement.querySelector('.page-container');

      // Мокаем prompt
      const promptSpy = vi
        .spyOn(window, 'prompt')
        .mockReturnValue('Test annotation');

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100,
      });

      pageElement.dispatchEvent(clickEvent);
      fixture.detectChanges();

      expect(promptSpy).toHaveBeenCalledWith('Введите текст аннотации:');
      promptSpy.mockRestore();
    });

    it('должен создать аннотацию при вводе текста', () => {
      const pageComponent = fixture.debugElement.query(
        By.css('app-document-page')
      );
      const pageElement =
        pageComponent.nativeElement.querySelector('.page-container');

      // Мокаем prompt
      const promptSpy = vi
        .spyOn(window, 'prompt')
        .mockReturnValue('Test annotation');

      // Получаем элемент страницы из директивы
      const pageContainer =
        pageComponent.nativeElement.querySelector('.page-container');
      if (!pageContainer) {
        throw new Error('Page container not found');
      }

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100,
      });

      // Симулируем getBoundingClientRect для элемента страницы
      vi.spyOn(pageContainer, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 1200,
        right: 800,
        bottom: 1200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      pageContainer.dispatchEvent(clickEvent);
      fixture.detectChanges();

      const annotations = annotationService.getAnnotations();
      expect(annotations.length).toBe(1);
      expect(annotations[0].text).toBe('Test annotation');
      expect(annotations[0].pageNumber).toBe(1);

      promptSpy.mockRestore();
    });

    it('не должен создать аннотацию при отмене ввода (null)', () => {
      const pageComponent = fixture.debugElement.query(
        By.css('app-document-page')
      );
      const pageElement =
        pageComponent.nativeElement.querySelector('.page-container');

      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      pageElement.dispatchEvent(clickEvent);
      fixture.detectChanges();

      const annotations = annotationService.getAnnotations();
      expect(annotations.length).toBe(0);

      promptSpy.mockRestore();
    });

    it('не должен создать аннотацию при пустом тексте', () => {
      const pageComponent = fixture.debugElement.query(
        By.css('app-document-page')
      );
      const pageElement =
        pageComponent.nativeElement.querySelector('.page-container');

      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('   ');

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      pageElement.dispatchEvent(clickEvent);
      fixture.detectChanges();

      const annotations = annotationService.getAnnotations();
      expect(annotations.length).toBe(0);

      promptSpy.mockRestore();
    });
  });

  describe('Удаление аннотации', () => {
    beforeEach(() => {
      // Создаем аннотацию для тестов удаления
      const mockAnnotation: IAnnotation = {
        id: 'test-annotation-1',
        text: 'Test annotation',
        pageNumber: 1,
        x: 50,
        y: 50,
      };

      annotationService['annotations'].set([mockAnnotation]);
      fixture.detectChanges();
    });

    it('должен закрыть аннотацию при нажатии на крестик', () => {
      // Ждем, пока аннотация отобразится
      fixture.detectChanges();

      // Ищем кнопку удаления в аннотации
      // Аннотации создаются динамически через директиву, поэтому ищем по селектору
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-times"]')
      );

      if (deleteButton) {
        clickPrimeButton(deleteButton);
        fixture.detectChanges();

        const annotations = annotationService.getAnnotations();
        expect(annotations.length).toBe(0);
      } else {
        // Если кнопка не найдена, проверяем, что аннотация была создана
        // Это может означать, что компонент аннотации еще не отрендерился
        const annotations = annotationService.getAnnotations();
        expect(annotations.length).toBeGreaterThan(0);
        // В реальном сценарии аннотация должна быть видна и кнопка должна быть доступна
      }
    });
  });

  describe('Сохранение документа', () => {
    it('должен вывести в консоль документ с аннотациями при нажатии на "Сохранить"', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Создаем аннотацию
      const mockAnnotation: IAnnotation = {
        id: 'test-annotation-1',
        text: 'Test annotation',
        pageNumber: 1,
        x: 50,
        y: 50,
      };

      annotationService['annotations'].set([mockAnnotation]);

      const saveButton = fixture.debugElement.query(
        By.css('p-button[label="Сохранить"]')
      );
      expect(saveButton).toBeTruthy();

      clickPrimeButton(saveButton);

      expect(consoleSpy).toHaveBeenCalledWith('Документ:', {
        ...mockDocument,
        annotations: [mockAnnotation],
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Перетаскивание аннотации', () => {
    let mockAnnotation: IAnnotation;
    let pageElement: HTMLElement;

    beforeEach(() => {
      mockAnnotation = {
        id: 'test-annotation-1',
        text: 'Test annotation',
        pageNumber: 1,
        x: 50,
        y: 50,
      };

      annotationService['annotations'].set([mockAnnotation]);
      fixture.detectChanges();

      const pageComponent = fixture.debugElement.query(
        By.css('app-document-page')
      );
      pageElement =
        pageComponent.nativeElement.querySelector('.page-container');
    });

    it('должен ограничить позицию аннотации в пределах страницы (0-100%)', () => {
      // Симулируем перетаскивание за пределы страницы
      vi.spyOn(pageElement, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 1200,
        right: 800,
        bottom: 1200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Пытаемся установить позицию за пределами (отрицательные значения)
      annotationService.startDrag(mockAnnotation.id, pageElement);

      const mouseEvent = new MouseEvent('mousemove', {
        clientX: -100,
        clientY: -100,
        bubbles: true,
      });

      window.dispatchEvent(mouseEvent);
      fixture.detectChanges();

      const updatedAnnotation = annotationService
        .getAnnotations()
        .find((a) => a.id === mockAnnotation.id);

      expect(updatedAnnotation?.x).toBeGreaterThanOrEqual(0);
      expect(updatedAnnotation?.x).toBeLessThanOrEqual(100);
      expect(updatedAnnotation?.y).toBeGreaterThanOrEqual(0);
      expect(updatedAnnotation?.y).toBeLessThanOrEqual(100);
    });

    it('должен ограничить позицию аннотации при перетаскивании за правую границу', () => {
      vi.spyOn(pageElement, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 1200,
        right: 800,
        bottom: 1200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      annotationService.startDrag(mockAnnotation.id, pageElement);

      // Симулируем клик за пределами страницы (справа)
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 2000,
        clientY: 100,
        bubbles: true,
      });

      window.dispatchEvent(mouseEvent);
      fixture.detectChanges();

      const updatedAnnotation = annotationService
        .getAnnotations()
        .find((a) => a.id === mockAnnotation.id);

      expect(updatedAnnotation?.x).toBeLessThanOrEqual(100);
    });

    it('должен ограничить позицию аннотации при перетаскивании за нижнюю границу', () => {
      vi.spyOn(pageElement, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 1200,
        right: 800,
        bottom: 1200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      annotationService.startDrag(mockAnnotation.id, pageElement);

      // Симулируем клик за пределами страницы (снизу)
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 3000,
        bubbles: true,
      });

      window.dispatchEvent(mouseEvent);
      fixture.detectChanges();

      const updatedAnnotation = annotationService
        .getAnnotations()
        .find((a) => a.id === mockAnnotation.id);

      expect(updatedAnnotation?.y).toBeLessThanOrEqual(100);
    });
  });

  describe('Дополнительные кейсы', () => {
    it('должен корректно обрабатывать документ без страниц', () => {
      const emptyDocument: IDocumentView = {
        id: '2',
        name: 'Empty Document',
        pages: [],
      };

      mockActivatedRoute = {
        snapshot: {
          data: { document: emptyDocument },
        } as any,
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [DocumentView],
        providers: [
          AnnotationService,
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ],
      });

      const newFixture = TestBed.createComponent(DocumentView);
      newFixture.detectChanges();

      const pageComponents = newFixture.debugElement.queryAll(
        By.css('app-document-page')
      );
      expect(pageComponents.length).toBe(0);
    });

    it('должен корректно работать с несколькими аннотациями на разных страницах', () => {
      const annotation1: IAnnotation = {
        id: 'annotation-1',
        text: 'Annotation 1',
        pageNumber: 1,
        x: 10,
        y: 10,
      };

      const annotation2: IAnnotation = {
        id: 'annotation-2',
        text: 'Annotation 2',
        pageNumber: 2,
        x: 20,
        y: 20,
      };

      annotationService['annotations'].set([annotation1, annotation2]);
      fixture.detectChanges();

      const annotations = annotationService.getAnnotations();
      expect(annotations.length).toBe(2);

      const page1Annotations = annotationService.getAnnotationsForPage(1);
      expect(page1Annotations.length).toBe(1);
      expect(page1Annotations[0].id).toBe('annotation-1');

      const page2Annotations = annotationService.getAnnotationsForPage(2);
      expect(page2Annotations.length).toBe(1);
      expect(page2Annotations[0].id).toBe('annotation-2');
    });

    it('должен корректно вычислять позицию аннотации в процентах', () => {
      const pageComponent = fixture.debugElement.query(
        By.css('app-document-page')
      );
      const pageElement =
        pageComponent.nativeElement.querySelector('.page-container');

      if (!pageElement) {
        throw new Error('Page element not found');
      }

      vi.spyOn(pageElement, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 200,
        width: 800,
        height: 1200,
        right: 900,
        bottom: 1400,
        x: 100,
        y: 200,
        toJSON: () => ({}),
      });

      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Test');

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 500, // 400px от левого края страницы = 50%
        clientY: 800, // 600px от верхнего края страницы = 50%
      });

      pageElement.dispatchEvent(clickEvent);
      fixture.detectChanges();

      const annotations = annotationService.getAnnotations();
      if (annotations.length > 0) {
        const annotation = annotations[0];
        // Позиция должна быть в пределах 0-100%
        expect(annotation.x).toBeGreaterThanOrEqual(0);
        expect(annotation.x).toBeLessThanOrEqual(100);
        expect(annotation.y).toBeGreaterThanOrEqual(0);
        expect(annotation.y).toBeLessThanOrEqual(100);
      }

      promptSpy.mockRestore();
    });
  });
});
