import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangePairComponent } from './exchange-pair.component';

describe('ExchangePairComponent', () => {
  let component: ExchangePairComponent;
  let fixture: ComponentFixture<ExchangePairComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangePairComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangePairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
