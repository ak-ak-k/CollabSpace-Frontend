import { TestBed } from '@angular/core/testing';
import { TypingIndicatorComponent } from './typing-indicator.component';

describe('TypingIndicatorComponent', () => {
  const render = async (text: string) => {
    const fixture = TestBed.createComponent(TypingIndicatorComponent);
    fixture.componentRef.setInput('text', text);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('renders nothing without text', async () => {
    const host = await render('');

    expect(host.textContent?.trim()).toBe('');
    expect(host.querySelector('.typing-indicator__dot')).toBeNull();
  });

  it('renders three hidden dots followed by the text', async () => {
    const host = await render('Rahul is typing…');

    expect(host.querySelectorAll('.typing-indicator__dot').length).toBe(3);
    expect(host.querySelector('.typing-indicator__dots')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('.typing-indicator__text')?.textContent).toBe('Rahul is typing…');
  });
});
