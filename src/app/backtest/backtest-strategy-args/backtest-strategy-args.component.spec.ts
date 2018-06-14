import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestStrategyArgsComponent } from './backtest-strategy-args.component';

describe('BacktestStrategyArgsComponent', () => {
  let component: BacktestStrategyArgsComponent;
  let fixture: ComponentFixture<BacktestStrategyArgsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestStrategyArgsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestStrategyArgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
