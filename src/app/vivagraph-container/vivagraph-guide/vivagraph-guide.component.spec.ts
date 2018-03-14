import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VivagraphGuideComponent } from './vivagraph-guide.component';

describe('VivagraphGuideComponent', () => {
  let component: VivagraphGuideComponent;
  let fixture: ComponentFixture<VivagraphGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
