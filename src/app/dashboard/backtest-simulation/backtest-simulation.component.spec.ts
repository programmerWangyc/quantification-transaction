import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestSimulationComponent } from './backtest-simulation.component';

describe('BacktestSimulationComponent', () => {
  let component: BacktestSimulationComponent;
  let fixture: ComponentFixture<BacktestSimulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestSimulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
