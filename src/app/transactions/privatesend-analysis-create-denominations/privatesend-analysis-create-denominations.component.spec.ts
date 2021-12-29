import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { PrivatesendAnalysisCreateDenominationsComponent } from './privatesend-analysis-create-denominations.component';

describe('PrivatesendAnalysisComponent', () => {
  let component: PrivatesendAnalysisCreateDenominationsComponent;
  let fixture: ComponentFixture<PrivatesendAnalysisCreateDenominationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivatesendAnalysisCreateDenominationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatesendAnalysisCreateDenominationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
