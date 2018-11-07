import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VivagraphAddressListComponent } from './vivagraph-address-list.component';

describe('VivagraphAddressListComponent', () => {
  let component: VivagraphAddressListComponent;
  let fixture: ComponentFixture<VivagraphAddressListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VivagraphAddressListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VivagraphAddressListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
