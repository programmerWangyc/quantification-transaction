import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyBacktestComponent } from './strategy-backtest.component';

describe('StrategyBacktestComponent', () => {
  let component: StrategyBacktestComponent;
  let fixture: ComponentFixture<StrategyBacktestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyBacktestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyBacktestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
