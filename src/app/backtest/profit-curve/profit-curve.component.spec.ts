import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitCurveComponent } from './profit-curve.component';

describe('ProfitCurveComponent', () => {
  let component: ProfitCurveComponent;
  let fixture: ComponentFixture<ProfitCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfitCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
