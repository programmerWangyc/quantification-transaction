import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestLogInfoComponent } from './backtest-log-info.component';

describe('BacktestLogInfoComponent', () => {
  let component: BacktestLogInfoComponent;
  let fixture: ComponentFixture<BacktestLogInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestLogInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestLogInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
