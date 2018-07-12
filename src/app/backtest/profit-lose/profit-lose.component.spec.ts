import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitLoseComponent } from './profit-lose.component';

describe('ProfitLoseComponent', () => {
  let component: ProfitLoseComponent;
  let fixture: ComponentFixture<ProfitLoseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfitLoseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitLoseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
