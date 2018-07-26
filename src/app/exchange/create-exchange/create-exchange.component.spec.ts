import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExchangeComponent } from './create-exchange.component';

describe('CreateExchangeComponent', () => {
  let component: CreateExchangeComponent;
  let fixture: ComponentFixture<CreateExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
