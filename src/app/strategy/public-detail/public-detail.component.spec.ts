import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicDetailComponent } from './public-detail.component';

describe('PublicDetailComponent', () => {
  let component: PublicDetailComponent;
  let fixture: ComponentFixture<PublicDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
