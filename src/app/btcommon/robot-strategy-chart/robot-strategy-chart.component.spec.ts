import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotStrategyChartComponent } from './robot-strategy-chart.component';

describe('RobotStrategyChartComponent', () => {
  let component: RobotStrategyChartComponent;
  let fixture: ComponentFixture<RobotStrategyChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotStrategyChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotStrategyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
