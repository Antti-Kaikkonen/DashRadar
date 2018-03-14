import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksTableComponent } from './blocks-table.component';

describe('BlocksTableComponent', () => {
  let component: BlocksTableComponent;
  let fixture: ComponentFixture<BlocksTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocksTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
