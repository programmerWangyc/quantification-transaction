import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotDebuggerComponent } from './robot-debugger.component';

describe('RobotDebugComponent', () => {
  let component: RobotDebuggerComponent;
  let fixture: ComponentFixture<RobotDebuggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotDebuggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotDebuggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
