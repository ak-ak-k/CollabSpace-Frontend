import { booleanAttribute, Component, input, output } from '@angular/core';
import { ReactionView } from '../../../core/models/thread';
import { IconComponent } from '../../ui/icon/icon.component';

const ADD_ICON_SIZE = 15;

@Component({
  selector: 'app-reaction-bar',
  imports: [IconComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss',
})
export class ReactionBarComponent {
  readonly reactions = input<readonly ReactionView[]>([]);
  readonly showAdd = input(false, { transform: booleanAttribute });

  readonly toggle = output<string>();
  readonly add = output<HTMLElement>();
  readonly reactorsShown = output<string>();

  protected readonly addIconSize = ADD_ICON_SIZE;

  protected showReactors(event: MouseEvent, reaction: ReactionView): void {
    event.preventDefault();
    event.stopPropagation();
    this.reactorsShown.emit(reaction.description);
  }
}
