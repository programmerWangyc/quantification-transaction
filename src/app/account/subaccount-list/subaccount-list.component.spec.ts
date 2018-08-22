import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubaccountListComponent } from './subaccount-list.component';

describe('SubaccountListComponent', () => {
  let component: SubaccountListComponent;
  let fixture: ComponentFixture<SubaccountListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubaccountListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubaccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
