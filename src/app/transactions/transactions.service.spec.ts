import { inject, TestBed } from '@angular/core/testing';

import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransactionsService]
    });
  });

  it('should ...', inject([TransactionsService], (service: TransactionsService) => {
    expect(service).toBeTruthy();
  }));
});
