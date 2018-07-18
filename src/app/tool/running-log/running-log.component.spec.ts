import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningLogComponent } from './running-log.component';

describe('RunningLogComponent', () => {
  let component: RunningLogComponent;
  let fixture: ComponentFixture<RunningLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunningLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
