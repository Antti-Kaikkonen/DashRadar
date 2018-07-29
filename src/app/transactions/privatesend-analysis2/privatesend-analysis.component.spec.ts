import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatesendAnalysis2Component } from './privatesend-analysis2.component';

describe('PrivatesendAnalysisComponent', () => {
  let component: PrivatesendAnalysis2Component;
  let fixture: ComponentFixture<PrivatesendAnalysis2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivatesendAnalysis2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatesendAnalysis2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
