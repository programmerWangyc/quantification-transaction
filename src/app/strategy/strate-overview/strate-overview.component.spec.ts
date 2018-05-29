import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrateOverviewComponent } from './strate-overview.component';

describe('StrateOverviewComponent', () => {
  let component: StrateOverviewComponent;
  let fixture: ComponentFixture<StrateOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrateOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrateOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
