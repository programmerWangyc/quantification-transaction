import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySubaccountPasswordComponent } from './modify-subaccount-password.component';

describe('ModifySubaccountPasswordComponent', () => {
  let component: ModifySubaccountPasswordComponent;
  let fixture: ComponentFixture<ModifySubaccountPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifySubaccountPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifySubaccountPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
