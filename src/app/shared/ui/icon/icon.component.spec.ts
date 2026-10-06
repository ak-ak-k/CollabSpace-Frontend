import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { ICON_NAMES } from './icon-registry';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the named icon as a decorative svg', async () => {
    fixture.componentRef.setInput('name', 'house');
    await fixture.whenStable();

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('applies the requested size', async () => {
    fixture.componentRef.setInput('name', 'search');
    fixture.componentRef.setInput('size', 22);
    await fixture.whenStable();

    expect(host.querySelector('svg')?.getAttribute('width')).toBe('22');
  });

  it('marks filled icons', async () => {
    fixture.componentRef.setInput('name', 'star');
    fixture.componentRef.setInput('filled', true);
    await fixture.whenStable();

    expect(host.classList.contains('icon--filled')).toBe(true);
  });

  it('registers every icon the design uses', () => {
    expect(ICON_NAMES.length).toBe(154);
    expect(ICON_NAMES).toContain('github');
    expect(ICON_NAMES).toContain('figma');
    expect(ICON_NAMES).toContain('scroll-text');
  });
});
