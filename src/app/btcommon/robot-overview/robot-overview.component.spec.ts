import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotOverviewComponent } from './robot-overview.component';

describe('RobotOverviewComponent', () => {
  let component: RobotOverviewComponent;
  let fixture: ComponentFixture<RobotOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
