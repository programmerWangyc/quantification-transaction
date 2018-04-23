import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotLogComponent } from './robot-log.component';

describe('RobotLogComponent', () => {
  let component: RobotLogComponent;
  let fixture: ComponentFixture<RobotLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
