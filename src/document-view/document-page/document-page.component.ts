import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AnnotationsDirective } from '../annotation/annotations.directive';

@Component({
  selector: 'app-document-page',
  templateUrl: './document-page.component.html',
  styleUrl: './document-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnnotationsDirective],
})
export class DocumentPageComponent {
  readonly pageNumber = input.required<number>();
  readonly imageUrl = input.required<string>();
  readonly documentName = input.required<string>();
}
