import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactRobotOverviewComponent } from './fact-robot-overview.component';

describe('FactRobotOverviewComponent', () => {
  let component: FactRobotOverviewComponent;
  let fixture: ComponentFixture<FactRobotOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactRobotOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactRobotOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
