import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoicesDemoComponent } from './choices-demo.component';

describe('ChoicesDemoComponent', () => {
  let fixture: ComponentFixture<ChoicesDemoComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ChoicesDemoComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows every radio appearance', () => {
    expect(host.querySelector('.radio-group--segmented')).not.toBeNull();
    expect(host.querySelector('.radio-group--list')).not.toBeNull();
    expect(host.querySelector('.radio-group--tiles')).not.toBeNull();
  });

  it('shows checkboxes and toggles in their on and off states', () => {
    const checkboxes = Array.from(
      host.querySelectorAll<HTMLInputElement>('app-checkbox input'),
    ).map((checkbox) => checkbox.checked);
    const switches = Array.from(host.querySelectorAll('[role="switch"]')).map((toggle) =>
      toggle.getAttribute('aria-checked'),
    );

    expect(checkboxes).toContain(true);
    expect(checkboxes).toContain(false);
    expect(switches).toContain('true');
    expect(switches).toContain('false');
  });

  it('keeps radio groups independent of each other', async () => {
    const tiles = host.querySelectorAll<HTMLInputElement>('.radio-group--tiles input');

    tiles[1].click();
    await fixture.whenStable();

    expect(tiles[1].checked).toBe(true);
    expect(host.querySelectorAll('input[type="radio"]:checked').length).toBe(5);
  });
});
