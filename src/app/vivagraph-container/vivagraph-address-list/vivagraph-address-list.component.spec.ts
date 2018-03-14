import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VivagraphListComponent } from './vivagraph-list.component';

describe('VivagraphListComponent', () => {
  let component: VivagraphListComponent;
  let fixture: ComponentFixture<VivagraphListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
