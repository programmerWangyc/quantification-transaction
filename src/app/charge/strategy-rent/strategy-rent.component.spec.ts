import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyRentComponent } from './strategy-rent.component';

describe('StrategyRentComponent', () => {
  let component: StrategyRentComponent;
  let fixture: ComponentFixture<StrategyRentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyRentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyRentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
