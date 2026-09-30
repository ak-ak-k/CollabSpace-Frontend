import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<SkeletonComponent>;
  let host: HTMLElement;

  const render = async (inputs: Record<string, unknown>) => {
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    await fixture.whenStable();
  };

  const barCounts = (selector: string) =>
    Array.from(host.querySelectorAll(selector)).map(
      (group) => group.querySelectorAll('.bar').length,
    );

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('announces a busy status and renders seven list rows by default', async () => {
    await render({});

    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.getAttribute('aria-label')).toBe('Loading');
    expect(host.classList.contains('skeleton--rows')).toBe(true);
    expect(host.querySelectorAll('.item').length).toBe(7);
  });

  it('reflects rows, label and compact spacing', async () => {
    await render({ layout: 'table', rows: 3, label: 'Loading files', compact: true });

    expect(host.getAttribute('aria-label')).toBe('Loading files');
    expect(host.classList.contains('skeleton--compact')).toBe(true);
    expect(host.querySelectorAll('.section__header .bar').length).toBe(1);
    expect(host.querySelectorAll('.item').length).toBe(3);
  });

  it('alternates three and two lines in the chat layout', async () => {
    await render({ layout: 'chat', rows: 4 });

    expect(barCounts('.item__bars')).toEqual([3, 2, 3, 2]);
  });

  it('renders six cards and five board columns', async () => {
    await render({ layout: 'cards' });
    expect(host.querySelectorAll('.item').length).toBe(6);

    await render({ layout: 'board' });
    expect(barCounts('.section').length).toBe(5);
    expect(
      Array.from(host.querySelectorAll('.section')).map(
        (column) => column.querySelectorAll('.item').length,
      ),
    ).toEqual([3, 2, 3, 2, 3]);
  });
});
