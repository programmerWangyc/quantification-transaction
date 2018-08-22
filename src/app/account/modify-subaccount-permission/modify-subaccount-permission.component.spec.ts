import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySubaccountPermissionComponent } from './modify-subaccount-permission.component';

describe('ModifySubaccountPermissionComponent', () => {
  let component: ModifySubaccountPermissionComponent;
  let fixture: ComponentFixture<ModifySubaccountPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifySubaccountPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifySubaccountPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
