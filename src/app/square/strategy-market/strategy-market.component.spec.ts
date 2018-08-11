import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyMarketComponent } from './strategy-market.component';

describe('StrategyMarketComponent', () => {
  let component: StrategyMarketComponent;
  let fixture: ComponentFixture<StrategyMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
