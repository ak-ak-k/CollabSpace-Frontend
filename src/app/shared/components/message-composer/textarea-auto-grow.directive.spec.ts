import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TextareaAutoGrowDirective } from './textarea-auto-grow.directive';

type ResizeCallback = (entries: readonly ResizeObserverEntry[]) => void;

let lastCallback: ResizeCallback | null = null;

class ResizeObserverStub {
  constructor(callback: ResizeCallback) {
    lastCallback = callback;
  }
  observe(): void {}
  disconnect(): void {}
}

const entryOfWidth = (width: number): ResizeObserverEntry =>
  ({ contentRect: { width } }) as ResizeObserverEntry;

@Component({
  imports: [TextareaAutoGrowDirective],
  template: `<textarea appTextareaAutoGrow rows="1"></textarea>`,
})
class AutoGrowHostComponent {}

describe('TextareaAutoGrowDirective', () => {
  const frame = vi.fn<(callback: FrameRequestCallback) => number>(() => 1);

  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('requestAnimationFrame', frame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });
  afterAll(() => vi.unstubAllGlobals());

  const render = async () => {
    lastCallback = null;
    frame.mockClear();
    const fixture = TestBed.createComponent(AutoGrowHostComponent);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  };

  it('sets an explicit height on input', async () => {
    const textarea = await render();

    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    expect(textarea.style.height).toMatch(/px$/);
  });

  it('schedules a refit only when the observed width changes', async () => {
    await render();
    frame.mockClear();

    lastCallback?.([entryOfWidth(320)]);
    lastCallback?.([entryOfWidth(320)]);
    lastCallback?.([entryOfWidth(480)]);

    expect(frame).toHaveBeenCalledTimes(2);
  });
});
