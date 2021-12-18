import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { VivagraphSettingsComponent } from './vivagraph-settings.component';

describe('VivagraphSettingsComponent', () => {
  let component: VivagraphSettingsComponent;
  let fixture: ComponentFixture<VivagraphSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
