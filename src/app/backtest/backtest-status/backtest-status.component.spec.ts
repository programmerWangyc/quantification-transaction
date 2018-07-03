import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestStatusComponent } from './backtest-status.component';

describe('BacktestStatusComponent', () => {
  let component: BacktestStatusComponent;
  let fixture: ComponentFixture<BacktestStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
