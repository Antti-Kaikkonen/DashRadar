import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { VivagraphSvgComponent } from './vivagraph-svg.component';

describe('VivagraphSvgComponent', () => {
  let component: VivagraphSvgComponent;
  let fixture: ComponentFixture<VivagraphSvgComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
