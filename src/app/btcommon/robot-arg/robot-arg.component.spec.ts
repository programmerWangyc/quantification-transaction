import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotArgComponent } from './robot-arg.component';

describe('RobotArgComponent', () => {
  let component: RobotArgComponent;
  let fixture: ComponentFixture<RobotArgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotArgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotArgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
