import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  isDevMode,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';

import { IDocumentView } from '../api/document.interface';
import { AnnotationService } from './annotation/annotation.service';
import { DocumentPageComponent } from './document-page/document-page.component';

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;
const ZOOM_DEFAULT = 100;

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.html',
  styleUrl: './document-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, DocumentPageComponent],
})
export class DocumentView implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly annotationService = inject(AnnotationService);

  protected readonly document = signal<IDocumentView | null>(null);
  protected readonly zoom = signal<number>(ZOOM_DEFAULT);

  protected readonly zoomPercent = computed(() => `${this.zoom()}%`);
  protected readonly canZoomIn = computed(() => this.zoom() < ZOOM_MAX);
  protected readonly canZoomOut = computed(() => this.zoom() > ZOOM_MIN);

  ngOnInit(): void {
    this.initDocument();
  }

  protected zoomIn(): void {
    this.zoom.update((current) => Math.min(current + ZOOM_STEP, ZOOM_MAX));
  }

  protected zoomOut(): void {
    this.zoom.update((current) => Math.max(current - ZOOM_STEP, ZOOM_MIN));
  }

  protected saveDocument(): void {
    const doc = this.document();
    if (!doc) return;

    const annotations = this.annotationService.getAnnotations();
    doc.annotations = annotations;

    console.log('Документ:', doc);
  }

  private initDocument(): void {
    const documentData = this.route.snapshot.data['document'] as
      | IDocumentView
      | undefined;

    if (isDevMode() && documentData) {
      console.log('Получение документа с id: ', documentData.id);
    }

    this.document.set(documentData ?? null);
  }
}
