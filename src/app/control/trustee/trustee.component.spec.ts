import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrusteeComponent } from './trustee.component';

describe('TrusteeComponent', () => {
  let component: TrusteeComponent;
  let fixture: ComponentFixture<TrusteeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrusteeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrusteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
