import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyTypeComponent } from './strategy-type.component';

describe('StrategyTypeComponent', () => {
  let component: StrategyTypeComponent;
  let fixture: ComponentFixture<StrategyTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
