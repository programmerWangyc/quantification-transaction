import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyDesComponent } from './strategy-des.component';

describe('StrategyDesComponent', () => {
  let component: StrategyDesComponent;
  let fixture: ComponentFixture<StrategyDesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyDesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyDesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
