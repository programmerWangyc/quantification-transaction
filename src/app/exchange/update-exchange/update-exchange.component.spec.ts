import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateExchangeComponent } from './update-exchange.component';

describe('UpdateExchangeComponent', () => {
  let component: UpdateExchangeComponent;
  let fixture: ComponentFixture<UpdateExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
