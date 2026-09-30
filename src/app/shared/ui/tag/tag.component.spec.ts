import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PRIORITY_TAG_TONES, TagComponent } from './tag.component';

@Component({
  imports: [TagComponent],
  template: `<app-tag [tone]="tone">Urgent</app-tag>`,
})
class TagHostComponent {
  readonly tone = PRIORITY_TAG_TONES.urgent;
}

describe('TagComponent', () => {
  it('renders its label with the requested tone', async () => {
    const fixture = TestBed.createComponent(TagHostComponent);
    await fixture.whenStable();
    const tag = (fixture.nativeElement as HTMLElement).querySelector('app-tag');

    expect(tag?.textContent?.trim()).toBe('Urgent');
    expect(tag?.classList.contains('tag--primary')).toBe(true);
  });

  it('keeps red for urgent only', () => {
    expect(PRIORITY_TAG_TONES.high).toBe('outline');
    expect(PRIORITY_TAG_TONES.medium).toBe('neutral');
    expect(PRIORITY_TAG_TONES.low).toBe('subtle');
  });
});
