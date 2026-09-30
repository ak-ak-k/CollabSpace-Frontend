import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextFieldsDemoComponent } from './text-fields-demo.component';

describe('TextFieldsDemoComponent', () => {
  let fixture: ComponentFixture<TextFieldsDemoComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TextFieldsDemoComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows every text control', () => {
    expect(host.querySelectorAll('app-input').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('app-textarea').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('app-select').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('app-search-input').length).toBeGreaterThan(0);
  });

  it('gives every control a unique id', () => {
    const ids = Array.from(host.querySelectorAll('[id]')).map((element) => element.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('updates the strength meter while the password is typed', async () => {
    const password = host.querySelector('input[autocomplete="new-password"]') as HTMLInputElement;

    password.value = 'Abcdefg1!';
    password.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(host.querySelector('app-password-strength')?.textContent).toContain('Strong');
  });
});
