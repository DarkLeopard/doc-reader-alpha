import { Component, inject, isDevMode, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { IDocumentView } from '../api/document.interface';

@Component({
  selector: 'app-doc-list',
  imports: [TableModule, ButtonModule, RouterLink],
  templateUrl: './doc-list.html',
  styleUrl: './doc-list.scss',
})
export class DocList implements OnInit {
  private readonly route = inject(ActivatedRoute);

  protected readonly documents = signal<IDocumentView[]>([]);

  ngOnInit(): void {
    this.initDocuments();
  }

  protected asDocument(documentUntyped: unknown): IDocumentView {
    return documentUntyped as IDocumentView;
  }

  private initDocuments(): void {
    const documents = this.route.snapshot.data['documents'] ?? [];

    if (isDevMode() && documents.length === 0) {
      console.error('Документы не найдены');
    }

    this.documents.set(documents);
  }
}
