import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleNzConfirmWrapComponent } from './simple-nz-confirm-wrap.component';

describe('SimpleNzConfirmWrapComponent', () => {
  let component: SimpleNzConfirmWrapComponent;
  let fixture: ComponentFixture<SimpleNzConfirmWrapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleNzConfirmWrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleNzConfirmWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
