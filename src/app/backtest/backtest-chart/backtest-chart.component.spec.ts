import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestChartComponent } from './backtest-chart.component';

describe('BacktestChartComponent', () => {
  let component: BacktestChartComponent;
  let fixture: ComponentFixture<BacktestChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
