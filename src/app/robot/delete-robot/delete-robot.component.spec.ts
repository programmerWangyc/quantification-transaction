import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRobotComponent } from './delete-robot.component';

describe('DeleteRobotComponent', () => {
  let component: DeleteRobotComponent;
  let fixture: ComponentFixture<DeleteRobotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteRobotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteRobotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
