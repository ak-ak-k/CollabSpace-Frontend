import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-conversation-search',
  imports: [IconButtonComponent, IconComponent],
  templateUrl: './conversation-search.component.html',
  styleUrl: './conversation-search.component.scss',
})
export class ConversationSearchComponent {
  readonly query = model('');
  readonly resultCount = input(0);
  readonly closed = output<void>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly resultLabel = computed(() => {
    if (!this.query().trim()) {
      return '';
    }
    return this.resultCount() === 1 ? '1 result' : `${this.resultCount()} results`;
  });

  constructor() {
    afterNextRender(() => this.field().nativeElement.focus());
  }

  protected close(): void {
    this.query.set('');
    this.closed.emit();
  }
}
