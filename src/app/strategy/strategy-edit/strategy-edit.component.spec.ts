import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyEditComponent } from './strategy-edit.component';

describe('StrategyEditComponent', () => {
  let component: StrategyEditComponent;
  let fixture: ComponentFixture<StrategyEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
