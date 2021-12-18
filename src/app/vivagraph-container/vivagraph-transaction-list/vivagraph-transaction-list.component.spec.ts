import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { VivagraphTransactionListComponent } from './vivagraph-transaction-list.component';

describe('VivagraphTransactionListComponent', () => {
  let component: VivagraphTransactionListComponent;
  let fixture: ComponentFixture<VivagraphTransactionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphTransactionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
