import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyRenewalComponent } from './strategy-renewal.component';

describe('StrategyRenewalComponent', () => {
  let component: StrategyRenewalComponent;
  let fixture: ComponentFixture<StrategyRenewalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyRenewalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
