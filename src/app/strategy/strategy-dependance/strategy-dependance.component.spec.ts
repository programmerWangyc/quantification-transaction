import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyDependanceComponent } from './strategy-dependance.component';

describe('StrategyDependanceComponent', () => {
  let component: StrategyDependanceComponent;
  let fixture: ComponentFixture<StrategyDependanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyDependanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyDependanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
