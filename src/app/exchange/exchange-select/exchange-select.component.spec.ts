import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeSelectComponent } from './exchange-select.component';

describe('ExchangeSelectComponent', () => {
  let component: ExchangeSelectComponent;
  let fixture: ComponentFixture<ExchangeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
