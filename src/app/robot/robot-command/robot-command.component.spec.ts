import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotCommandComponent } from './robot-command.component';

describe('RobotCommandComponent', () => {
  let component: RobotCommandComponent;
  let fixture: ComponentFixture<RobotCommandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotCommandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
