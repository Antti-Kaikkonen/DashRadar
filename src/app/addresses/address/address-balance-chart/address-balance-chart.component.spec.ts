import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressBalanceChartComponent } from './address-balance-chart.component';

describe('AddressBalanceChartComponent', () => {
  let component: AddressBalanceChartComponent;
  let fixture: ComponentFixture<AddressBalanceChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressBalanceChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressBalanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
