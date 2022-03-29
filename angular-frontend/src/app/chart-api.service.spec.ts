import { TestBed } from '@angular/core/testing';

import { Chart_Api_Service } from './chart-api.service';

describe('ChartApiService', () => {
  let service: Chart_Api_Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Chart_Api_Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
