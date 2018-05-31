import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareConfirmComponent } from './share-confirm.component';

describe('ShareConfirmComponent', () => {
  let component: ShareConfirmComponent;
  let fixture: ComponentFixture<ShareConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
