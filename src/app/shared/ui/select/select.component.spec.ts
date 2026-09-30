import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent, SelectOption } from './select.component';

const TEAMS: readonly SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Data Platform' },
];

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>;
  let host: HTMLElement;

  const control = (): HTMLSelectElement => host.querySelector('select') as HTMLSelectElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('label', 'Add to team');
    fixture.componentRef.setInput('options', TEAMS);
  });

  it('renders a labelled select with every option', async () => {
    fixture.componentRef.setInput('value', 'platform');
    await fixture.whenStable();

    expect(host.querySelector('label')?.getAttribute('for')).toBe(control().id);
    expect(control().options.length).toBe(2);
    expect(control().value).toBe('platform');
  });

  it('writes the picked option to the value', async () => {
    await fixture.whenStable();

    control().value = 'design';
    control().dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('design');
  });

  it('shows a placeholder while nothing is picked', async () => {
    fixture.componentRef.setInput('placeholder', 'Choose a team');
    await fixture.whenStable();

    expect(control().options.length).toBe(3);
    expect(control().selectedOptions[0]?.textContent?.trim()).toBe('Choose a team');
  });

  it('links the error message to the select', async () => {
    fixture.componentRef.setInput('errorMessage', 'Pick a team.');
    await fixture.whenStable();

    const errorId = host.querySelector('app-field-error')?.id;
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(control().getAttribute('aria-describedby')).toBe(errorId);
  });
});
