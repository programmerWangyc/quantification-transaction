import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactRobotComponent } from './fact-robot.component';

describe('FactRobotComponent', () => {
  let component: FactRobotComponent;
  let fixture: ComponentFixture<FactRobotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactRobotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactRobotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
