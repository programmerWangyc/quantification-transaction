import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyVerifyCodeComponent } from './strategy-verify-code.component';

describe('StrategyVerifyCodeComponent', () => {
  let component: StrategyVerifyCodeComponent;
  let fixture: ComponentFixture<StrategyVerifyCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyVerifyCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyVerifyCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
