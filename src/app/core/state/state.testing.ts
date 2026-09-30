import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MOCK_LATENCY } from '../data/mock-request';

export const INSTANT_MOCK_DATA: Provider = {
  provide: MOCK_LATENCY,
  useValue: { minimum: 0, maximum: 0 },
};

export const settle = async (): Promise<void> => {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  TestBed.tick();
};
