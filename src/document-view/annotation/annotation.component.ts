import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';

import { IAnnotation } from '../../api/annotation.interface';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrl: './annotation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
})
export class AnnotationComponent {
  readonly annotation = input.required<IAnnotation>();
  readonly isDragging = input<boolean>(false);

  readonly dragStart = output<{ annotationId: string; event: MouseEvent }>();
  readonly delete = output<{ annotationId: string; event: MouseEvent }>();

  protected onDragStart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragStart.emit({
      annotationId: this.annotation().id,
      event,
    });
  }

  protected onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit({
      annotationId: this.annotation().id,
      event,
    });
  }

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
