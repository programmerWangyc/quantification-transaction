import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestResultComponent } from './backtest-result.component';

describe('BacktestResultComponent', () => {
  let component: BacktestResultComponent;
  let fixture: ComponentFixture<BacktestResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
