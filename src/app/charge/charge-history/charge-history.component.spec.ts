import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeHistoryComponent } from './charge-history.component';

describe('ChargeHistoryComponent', () => {
  let component: ChargeHistoryComponent;
  let fixture: ComponentFixture<ChargeHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
