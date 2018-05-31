import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerShareConfirmComponent } from './inner-share-confirm.component';

describe('InnerShareConfirmComponent', () => {
  let component: InnerShareConfirmComponent;
  let fixture: ComponentFixture<InnerShareConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InnerShareConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerShareConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
