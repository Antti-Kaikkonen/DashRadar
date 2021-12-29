import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { NodesDashboardComponent } from './nodes-dashboard.component';

describe('NodesDashboardComponent', () => {
  let component: NodesDashboardComponent;
  let fixture: ComponentFixture<NodesDashboardComponent>;

  beforeEach(waitForAsync(() => {
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
