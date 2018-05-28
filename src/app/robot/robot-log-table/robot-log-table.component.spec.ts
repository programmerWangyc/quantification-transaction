import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotLogTableComponent } from './robot-log-table.component';

describe('RobotLogTableComponent', () => {
  let component: RobotLogTableComponent;
  let fixture: ComponentFixture<RobotLogTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotLogTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotLogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
