import { Component } from '@angular/core';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-offline-note',
  imports: [IconComponent],
  templateUrl: './offline-note.component.html',
  styleUrl: './offline-note.component.scss',
  host: { role: 'status' },
})
export class OfflineNoteComponent {}
