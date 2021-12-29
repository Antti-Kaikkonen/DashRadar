import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { PrivatesendAnalysisAddressClustersComponent } from './privatesend-analysis-address-clusters.component';

describe('PrivatesendAnalysisComponent', () => {
  let component: PrivatesendAnalysisAddressClustersComponent;
  let fixture: ComponentFixture<PrivatesendAnalysisAddressClustersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivatesendAnalysisAddressClustersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatesendAnalysisAddressClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
