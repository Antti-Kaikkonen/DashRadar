import { inject, TestBed } from '@angular/core/testing';

import { BlockService } from './block.service';

describe('BlocksService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlockService]
    });
  });

  it('should ...', inject([BlockService], (service: BlockService) => {
    expect(service).toBeTruthy();
  }));
});
