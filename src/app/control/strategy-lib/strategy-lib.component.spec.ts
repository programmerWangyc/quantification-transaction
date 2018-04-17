import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyLibComponent } from './strategy-lib.component';

describe('StrategyLibComponent', () => {
  let component: StrategyLibComponent;
  let fixture: ComponentFixture<StrategyLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
