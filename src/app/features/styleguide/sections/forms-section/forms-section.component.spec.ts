import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsSectionComponent } from './forms-section.component';

describe('FormsSectionComponent', () => {
  let fixture: ComponentFixture<FormsSectionComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FormsSectionComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows a titled block for every form control', () => {
    const titles = Array.from(host.querySelectorAll('h3')).map((title) =>
      title.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Input',
      'Textarea',
      'Select',
      'Search input',
      'Checkbox',
      'Radio group',
      'Toggle',
      'Signal Forms example',
    ]);
  });

  it('labels every native control', () => {
    const unlabelled = Array.from(
      host.querySelectorAll<HTMLElement>('input, select, textarea, [role="switch"]'),
    ).filter(
      (control) =>
        !control.hasAttribute('aria-label') &&
        !control.hasAttribute('aria-labelledby') &&
        !control.closest('label') &&
        !host.querySelector(`label[for="${control.id}"]`),
    );

    expect(unlabelled).toEqual([]);
  });
});
