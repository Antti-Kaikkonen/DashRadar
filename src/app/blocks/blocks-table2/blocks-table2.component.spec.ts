import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { BlocksTable2Component } from './blocks-table2.component';

describe('BlocksTable2Component', () => {
  let component: BlocksTable2Component;
  let fixture: ComponentFixture<BlocksTable2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocksTable2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocksTable2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
