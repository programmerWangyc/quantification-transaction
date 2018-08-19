import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeAddComponent } from './exchange-add.component';

describe('ExchangeAddComponent', () => {
  let component: ExchangeAddComponent;
  let fixture: ComponentFixture<ExchangeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
