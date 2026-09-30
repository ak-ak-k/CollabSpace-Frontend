import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldErrorComponent } from './field-error.component';

describe('FieldErrorComponent', () => {
  let fixture: ComponentFixture<FieldErrorComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldErrorComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the message next to a decorative icon', async () => {
    fixture.componentRef.setInput('message', 'Enter your email address.');
    await fixture.whenStable();

    expect(host.textContent?.trim()).toBe('Enter your email address.');
    expect(host.querySelector('app-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('updates when the message changes', async () => {
    fixture.componentRef.setInput('message', 'First');
    await fixture.whenStable();
    fixture.componentRef.setInput('message', 'Second');
    await fixture.whenStable();

    expect(host.textContent?.trim()).toBe('Second');
  });
});
