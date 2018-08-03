import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentIndicatorComponent } from './payment-indicator.component';

describe('PaymentIndicatorComponent', () => {
  let component: PaymentIndicatorComponent;
  let fixture: ComponentFixture<PaymentIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
