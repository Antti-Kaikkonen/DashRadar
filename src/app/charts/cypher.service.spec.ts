import { inject, TestBed } from '@angular/core/testing';

import { CypherService } from './cypher.service';

describe('CypherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CypherService]
    });
  });

  it('should be created', inject([CypherService], (service: CypherService) => {
    expect(service).toBeTruthy();
  }));
});
