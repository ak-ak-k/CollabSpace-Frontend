import { TestBed } from '@angular/core/testing';
import { DateSeparatorComponent } from './date-separator.component';

describe('DateSeparatorComponent', () => {
  const render = async (label: string, variant: 'day' | 'new') => {
    const fixture = TestBed.createComponent(DateSeparatorComponent);
    fixture.componentRef.setInput('label', label);
    fixture.componentRef.setInput('variant', variant);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('renders a day label followed by one rule', async () => {
    const host = await render('Today', 'day');

    expect(host.getAttribute('role')).toBe('separator');
    expect(host.getAttribute('aria-label')).toBe('Today');
    expect(host.querySelector('.date-separator__label')?.textContent).toBe('Today');
    expect(host.querySelectorAll('.date-separator__rule').length).toBe(1);
  });

  it('renders the new-messages marker with a single leading rule', async () => {
    const host = await render('', 'new');

    expect(host.getAttribute('aria-label')).toBe('New messages');
    expect(host.classList.contains('date-separator--new')).toBe(true);
    expect(host.querySelector('.date-separator__label')?.textContent).toBe('New');
    expect(host.querySelectorAll('.date-separator__rule').length).toBe(1);
  });
});
