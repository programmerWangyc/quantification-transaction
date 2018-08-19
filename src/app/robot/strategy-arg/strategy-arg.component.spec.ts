import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyArgComponent } from './strategy-arg.component';

describe('StrategyArgComponent', () => {
  let component: StrategyArgComponent;
  let fixture: ComponentFixture<StrategyArgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyArgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyArgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
