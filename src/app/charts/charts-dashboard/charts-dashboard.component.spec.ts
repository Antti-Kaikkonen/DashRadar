import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsDashboardComponent } from './charts-dashboard.component';

describe('ChartsDashboardComponent', () => {
  let component: ChartsDashboardComponent;
  let fixture: ComponentFixture<ChartsDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
