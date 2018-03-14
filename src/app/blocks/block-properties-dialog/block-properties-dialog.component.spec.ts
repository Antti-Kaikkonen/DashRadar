import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockPropertiesDialogComponent } from './block-properties-dialog.component';

describe('BlockPropertiesDialogComponent', () => {
  let component: BlockPropertiesDialogComponent;
  let fixture: ComponentFixture<BlockPropertiesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockPropertiesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockPropertiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
