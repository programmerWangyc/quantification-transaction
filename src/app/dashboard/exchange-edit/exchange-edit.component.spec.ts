import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeEditComponent } from './exchange-edit.component';

describe('ExchangeEditComponent', () => {
  let component: ExchangeEditComponent;
  let fixture: ComponentFixture<ExchangeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
