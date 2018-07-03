import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestLogComponent } from './backtest-log.component';

describe('BacktestLogComponent', () => {
  let component: BacktestLogComponent;
  let fixture: ComponentFixture<BacktestLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
