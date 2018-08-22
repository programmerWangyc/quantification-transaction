import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubaccountComponent } from './subaccount.component';

describe('SubaccountComponent', () => {
  let component: SubaccountComponent;
  let fixture: ComponentFixture<SubaccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubaccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubaccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
