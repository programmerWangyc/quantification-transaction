import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOptionsComponent } from './time-options.component';

describe('TimeOptionsComponent', () => {
  let component: TimeOptionsComponent;
  let fixture: ComponentFixture<TimeOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
