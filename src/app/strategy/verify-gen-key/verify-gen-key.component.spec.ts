import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyGenKeyComponent } from './verify-gen-key.component';

describe('VerifyGenKeyComponent', () => {
  let component: VerifyGenKeyComponent;
  let fixture: ComponentFixture<VerifyGenKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyGenKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyGenKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
