import { TestBed } from '@angular/core/testing';

import { UteisService } from './uteis.service';

describe('UteisService', () => {
  let service: UteisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UteisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
