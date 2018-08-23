import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EarlyWarningComponent } from './early-warning.component';

describe('EarlyWarningComponent', () => {
  let component: EarlyWarningComponent;
  let fixture: ComponentFixture<EarlyWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EarlyWarningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EarlyWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
