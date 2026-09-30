import { TestBed } from '@angular/core/testing';
import { TooltipBubbleComponent } from './tooltip-bubble.component';

describe('TooltipBubbleComponent', () => {
  it('renders the text as a decorative bubble', async () => {
    const fixture = TestBed.createComponent(TooltipBubbleComponent);
    fixture.componentRef.setInput('text', 'Copy link');
    await fixture.whenStable();
    const bubble = fixture.nativeElement as HTMLElement;

    expect(bubble.textContent?.trim()).toBe('Copy link');
    expect(bubble.getAttribute('aria-hidden')).toBe('true');
  });
});
