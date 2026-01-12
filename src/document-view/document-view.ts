import { Component, inject, isDevMode, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDocumentView } from '../api/document.interface';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.html',
  styleUrl: './document-view.scss',
})
export class DocumentView implements OnInit {
  private readonly route = inject(ActivatedRoute);

  protected readonly document = signal<IDocumentView | null>(null);

  ngOnInit(): void {
    this.initDocument();
  }

  private initDocument(): void {
    const document = this.route.snapshot.data['document'];

    if (isDevMode()) {
      console.log('Получение документа с id: ', document);
    }

    this.document.set(document);
  }
}
