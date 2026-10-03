import { TestBed } from '@angular/core/testing';
import { ErrorReportService } from './error-report.service';

describe('ErrorReportService', () => {
  it('creates a support reference for each failure', () => {
    const service = TestBed.inject(ErrorReportService);
    const reference = service.report();

    expect(reference).toMatch(/^CS-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(service.reference()).toBe(reference);
  });

  it('forgets the reference once cleared', () => {
    const service = TestBed.inject(ErrorReportService);
    service.report();

    service.clear();

    expect(service.reference()).toBeNull();
  });
});
