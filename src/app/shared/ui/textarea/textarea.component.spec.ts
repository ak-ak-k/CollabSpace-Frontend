import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let fixture: ComponentFixture<TextareaComponent>;
  let host: HTMLElement;

  const control = (): HTMLTextAreaElement => host.querySelector('textarea') as HTMLTextAreaElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TextareaComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('label', 'Personal note');
  });

  it('renders a labelled textarea with three rows by default', async () => {
    await fixture.whenStable();

    expect(host.querySelector('label')?.getAttribute('for')).toBe(control().id);
    expect(control().rows).toBe(3);
    expect(control().hasAttribute('aria-describedby')).toBe(false);
  });

  it('writes typed text to the value', async () => {
    await fixture.whenStable();

    control().value = 'Welcome to the team';
    control().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('Welcome to the team');
  });

  it('counts characters against the maximum length', async () => {
    fixture.componentRef.setInput('maxlength', 280);
    fixture.componentRef.setInput('showCount', true);
    fixture.componentRef.setInput('value', 'Hello');
    await fixture.whenStable();

    const count = host.querySelector('.field__count');
    expect(count?.textContent).toContain('5 / 280');
    expect(control().getAttribute('maxlength')).toBe('280');
    expect(control().getAttribute('aria-describedby')).toBe(count?.id);
  });

  it('marks the textarea invalid when an error message is forced', async () => {
    fixture.componentRef.setInput('errorMessage', 'Add a short description.');
    await fixture.whenStable();

    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector('app-field-error')?.textContent).toContain(
      'Add a short description.',
    );
  });
});
