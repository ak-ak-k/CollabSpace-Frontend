import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchStatusComponent } from './search-status.component';

describe('SearchStatusComponent', () => {
  let fixture: ComponentFixture<SearchStatusComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchStatusComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('term', 'priya');
  });

  it('is a status region that stays empty while idle', async () => {
    fixture.componentRef.setInput('status', 'idle');
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('status');
    expect(host.textContent?.trim()).toBe('');
  });

  it('names the query while searching', async () => {
    fixture.componentRef.setInput('status', 'searching');
    await fixture.whenStable();

    expect(host.textContent).toContain('Searching for “priya”…');
  });

  it('explains an empty result', async () => {
    fixture.componentRef.setInput('status', 'empty');
    await fixture.whenStable();

    expect(host.textContent).toContain('No results for “priya”');
    expect(host.textContent).toContain(
      'Check the spelling, try fewer words, or search a different category.',
    );
  });

  it('announces how many results arrived', async () => {
    fixture.componentRef.setInput('status', 'results');
    fixture.componentRef.setInput('total', 12);
    await fixture.whenStable();

    expect(host.querySelector('.visually-hidden')?.textContent).toBe('12 results');
  });
});
