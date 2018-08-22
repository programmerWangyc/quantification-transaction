import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleVerifyComponent } from './google-verify.component';

describe('GoogleVerifyComponent', () => {
  let component: GoogleVerifyComponent;
  let fixture: ComponentFixture<GoogleVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
