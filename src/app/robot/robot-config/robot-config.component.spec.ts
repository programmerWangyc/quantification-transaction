import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotConfigComponent } from './robot-config.component';

describe('RobotConfigComponent', () => {
  let component: RobotConfigComponent;
  let fixture: ComponentFixture<RobotConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
