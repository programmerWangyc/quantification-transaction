import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestStrategyChartComponent } from './backtest-strategy-chart.component';

describe('BacktestStrategyChartComponent', () => {
  let component: BacktestStrategyChartComponent;
  let fixture: ComponentFixture<BacktestStrategyChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestStrategyChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestStrategyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
