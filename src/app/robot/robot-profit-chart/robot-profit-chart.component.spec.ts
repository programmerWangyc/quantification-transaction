import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotProfitChartComponent } from './robot-profit-chart.component';

describe('RobotProfitChartComponent', () => {
  let component: RobotProfitChartComponent;
  let fixture: ComponentFixture<RobotProfitChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotProfitChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotProfitChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
