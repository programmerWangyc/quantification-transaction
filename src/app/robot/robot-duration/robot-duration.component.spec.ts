import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotDurationComponent } from './robot-duration.component';

describe('RobotDurationComponent', () => {
  let component: RobotDurationComponent;
  let fixture: ComponentFixture<RobotDurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotDurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
