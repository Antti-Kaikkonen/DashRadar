import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatesendAnalysisComponent } from './privatesend-analysis.component';

describe('PrivatesendAnalysisComponent', () => {
  let component: PrivatesendAnalysisComponent;
  let fixture: ComponentFixture<PrivatesendAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivatesendAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatesendAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
