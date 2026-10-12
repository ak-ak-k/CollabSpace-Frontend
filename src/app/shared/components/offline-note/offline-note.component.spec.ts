import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OfflineNoteComponent } from './offline-note.component';

@Component({
  imports: [OfflineNoteComponent],
  template: `<app-offline-note>Showing what loaded before you went offline.</app-offline-note>`,
})
class OfflineNoteHostComponent {}

describe('OfflineNoteComponent', () => {
  it('announces the projected message as a status', async () => {
    const fixture = TestBed.createComponent(OfflineNoteHostComponent);
    await fixture.whenStable();
    const note = (fixture.nativeElement as HTMLElement).querySelector('app-offline-note');

    expect(note?.getAttribute('role')).toBe('status');
    expect(note?.textContent).toContain('Showing what loaded before you went offline.');
    expect(note?.querySelector('app-icon')).not.toBeNull();
  });
});
