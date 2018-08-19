import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotDetailComponent } from './robot-detail.component';

describe('RobotDetailComponent', () => {
  let component: RobotDetailComponent;
  let fixture: ComponentFixture<RobotDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
