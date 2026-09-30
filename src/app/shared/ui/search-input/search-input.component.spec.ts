import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  let fixture: ComponentFixture<SearchInputComponent>;
  let host: HTMLElement;

  const control = (): HTMLInputElement => host.querySelector('input') as HTMLInputElement;
  const clearButton = (): HTMLButtonElement | null => host.querySelector('button');

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('label', 'Search people');
  });

  it('renders a named search field without a clear button while empty', async () => {
    fixture.componentRef.setInput('placeholder', 'Search by name or title');
    await fixture.whenStable();

    expect(control().type).toBe('search');
    expect(control().getAttribute('aria-label')).toBe('Search people');
    expect(control().getAttribute('placeholder')).toBe('Search by name or title');
    expect(clearButton()).toBeNull();
  });

  it('writes typed text to the value', async () => {
    await fixture.whenStable();

    control().value = 'aarav';
    control().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('aarav');
    expect(clearButton()?.getAttribute('aria-label')).toBe('Clear search');
  });

  it('clears the text and reports it', async () => {
    const cleared = vi.fn();
    fixture.componentInstance.cleared.subscribe(cleared);
    fixture.componentRef.setInput('value', 'aarav');
    await fixture.whenStable();

    clearButton()?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('');
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(clearButton()).toBeNull();
  });

  it('hides the clear button when it is not clearable', async () => {
    fixture.componentRef.setInput('clearable', false);
    fixture.componentRef.setInput('value', 'aarav');
    await fixture.whenStable();

    expect(clearButton()).toBeNull();
  });
});
