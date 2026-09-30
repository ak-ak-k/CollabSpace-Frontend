import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandMarkComponent } from '../../../shared/components/brand-mark/brand-mark.component';

interface PosterPoint {
  readonly number: string;
  readonly text: string;
}

const POSTER_POINTS: readonly PosterPoint[] = [
  { number: '01', text: 'Channels, direct messages and group chats' },
  { number: '02', text: 'A task board that moves with the conversation' },
  { number: '03', text: 'Files, search and presence in one place' },
];

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, BrandMarkComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  protected readonly points = POSTER_POINTS;
}
