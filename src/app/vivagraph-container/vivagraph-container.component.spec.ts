import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VivagraphContainerComponent } from './vivagraph-container.component';

describe('VivagraphContainerComponent', () => {
  let component: VivagraphContainerComponent;
  let fixture: ComponentFixture<VivagraphContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
