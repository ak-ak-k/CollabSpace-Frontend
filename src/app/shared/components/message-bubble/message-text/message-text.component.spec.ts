import { TestBed } from '@angular/core/testing';
import { TextSegment } from '../../../../core/models/thread';
import { MessageTextComponent } from './message-text.component';

const SEGMENTS: readonly TextSegment[] = [
  { text: 'Run ', style: 'plain', href: null },
  { text: 'npm ci', style: 'code', href: null },
  { text: ' and read ', style: 'plain', href: null },
  { text: 'https://angular.dev', style: 'link', href: 'https://angular.dev' },
  { text: ' <b>now</b>', style: 'italic', href: null },
];

describe('MessageTextComponent', () => {
  it('renders code, a safe new-tab link and user text without interpreting HTML', async () => {
    const fixture = TestBed.createComponent(MessageTextComponent);
    fixture.componentRef.setInput('segments', SEGMENTS);
    fixture.componentRef.setInput('edited', true);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const link = host.querySelector('a') as HTMLAnchorElement;

    expect(host.querySelector('code')?.textContent).toBe('npm ci');
    expect(link.href).toBe('https://angular.dev/');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(host.querySelector('em')?.textContent).toBe(' <b>now</b>');
    expect(host.querySelector('b')).toBeNull();
    expect(host.querySelector('.message-text__edited')?.textContent).toBe(' (edited)');
  });
});
