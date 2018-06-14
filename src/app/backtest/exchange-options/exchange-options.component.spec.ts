import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOptionsComponent } from './exchange-options.component';

describe('ExchangeOptionsComponent', () => {
  let component: ExchangeOptionsComponent;
  let fixture: ComponentFixture<ExchangeOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
