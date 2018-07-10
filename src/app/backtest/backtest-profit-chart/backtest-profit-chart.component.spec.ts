import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestProfitChartComponent } from './backtest-profit-chart.component';

describe('BacktestProfitChartComponent', () => {
  let component: BacktestProfitChartComponent;
  let fixture: ComponentFixture<BacktestProfitChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestProfitChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestProfitChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
