import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioGroupComponent, RadioOption } from './radio-group.component';

const PRIVACY: readonly RadioOption[] = [
  { value: 'public', label: 'Public', icon: 'globe', description: 'Anyone can join.' },
  { value: 'private', label: 'Private', icon: 'lock', description: 'Invite only.' },
];

describe('RadioGroupComponent', () => {
  let fixture: ComponentFixture<RadioGroupComponent>;
  let host: HTMLElement;

  const radios = (): HTMLInputElement[] => Array.from(host.querySelectorAll('input'));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('label', 'Privacy');
    fixture.componentRef.setInput('options', PRIVACY);
  });

  it('renders a labelled radiogroup of native radios that share a name', async () => {
    fixture.componentRef.setInput('value', 'private');
    await fixture.whenStable();

    const group = host.querySelector('[role="radiogroup"]');
    const labelId = group?.getAttribute('aria-labelledby') ?? '';
    expect(host.querySelector(`[id="${labelId}"]`)?.textContent?.trim()).toBe('Privacy');
    expect(radios().map((radio) => radio.type)).toEqual(['radio', 'radio']);
    expect(radios()[0].name).not.toBe('');
    expect(radios()[0].name).toBe(radios()[1].name);
    expect(radios().map((radio) => radio.checked)).toEqual([false, true]);
    expect(host.classList.contains('radio-group--segmented')).toBe(true);
  });

  it('writes the picked option to the value', async () => {
    await fixture.whenStable();

    radios()[0].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('public');
    expect(host.querySelectorAll('.option--selected').length).toBe(1);
  });

  it('shows dots and descriptions in the list appearance', async () => {
    fixture.componentRef.setInput('appearance', 'list');
    await fixture.whenStable();

    const descriptionId = radios()[0].getAttribute('aria-describedby') ?? '';
    expect(host.querySelectorAll('.option__dot').length).toBe(2);
    expect(host.querySelector(`[id="${descriptionId}"]`)?.textContent?.trim()).toBe(
      'Anyone can join.',
    );
  });

  it('gives every group its own name', async () => {
    const other = TestBed.createComponent(RadioGroupComponent);
    other.componentRef.setInput('label', 'Role');
    other.componentRef.setInput('options', PRIVACY);
    await fixture.whenStable();
    await other.whenStable();

    const otherRadio = (other.nativeElement as HTMLElement).querySelector('input');
    expect(otherRadio?.name).not.toBe(radios()[0].name);
  });
});
