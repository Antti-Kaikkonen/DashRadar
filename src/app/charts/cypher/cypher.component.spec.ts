import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CypherComponent } from './cypher.component';

describe('CypherComponent', () => {
  let component: CypherComponent;
  let fixture: ComponentFixture<CypherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CypherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CypherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
