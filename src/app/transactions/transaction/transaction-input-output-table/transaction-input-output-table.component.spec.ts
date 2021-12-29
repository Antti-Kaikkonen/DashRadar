import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { TransactionInputOutputTableComponent } from './transaction-input-output-table.component';

describe('TransactionInputOutputTableComponent', () => {
  let component: TransactionInputOutputTableComponent;
  let fixture: ComponentFixture<TransactionInputOutputTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionInputOutputTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionInputOutputTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
