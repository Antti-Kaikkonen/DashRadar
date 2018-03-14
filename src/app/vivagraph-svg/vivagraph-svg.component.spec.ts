import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VivagraphSvgComponent } from './vivagraph-svg.component';

describe('VivagraphSvgComponent', () => {
  let component: VivagraphSvgComponent;
  let fixture: ComponentFixture<VivagraphSvgComponent>;

  beforeEach(async(() => {
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
