import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodesDashboardComponent } from './nodes-dashboard.component';

describe('NodesDashboardComponent', () => {
  let component: NodesDashboardComponent;
  let fixture: ComponentFixture<NodesDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodesDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
